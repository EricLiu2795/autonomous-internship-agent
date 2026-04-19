interface Job {
  company: string;
  title: string;
  location: string;
  url: string;
}

// Fallback job data in case API fails
const FALLBACK_JOBS: Job[] = [
  {
    company: 'Google',
    title: 'Software Engineering Intern',
    location: 'Mountain View, CA',
    url: 'https://careers.google.com/jobs',
  },
  {
    company: 'Meta',
    title: 'Software Engineer Intern',
    location: 'Menlo Park, CA',
    url: 'https://www.metacareers.com/jobs',
  },
  {
    company: 'OpenAI',
    title: 'AI Research Intern',
    location: 'San Francisco, CA',
    url: 'https://openai.com/careers',
  },
  {
    company: 'Jane Street',
    title: 'Software Engineering Intern',
    location: 'New York, NY',
    url: 'https://www.janestreet.com/join-jane-street/open-roles/',
  },
  {
    company: 'Datadog',
    title: 'Software Engineer Intern',
    location: 'New York, NY',
    url: 'https://www.datadoghq.com/careers/',
  },
  {
    company: 'Stripe',
    title: 'Software Engineering Intern',
    location: 'San Francisco, CA',
    url: 'https://stripe.com/jobs',
  },
  {
    company: 'Anthropic',
    title: 'AI Safety Research Intern',
    location: 'San Francisco, CA',
    url: 'https://www.anthropic.com/careers',
  },
  {
    company: 'Scale AI',
    title: 'ML Engineering Intern',
    location: 'San Francisco, CA',
    url: 'https://scale.com/careers',
  },
];

/**
 * Fetch internship jobs from Greenhouse API
 * Falls back to hardcoded data if API fails
 */
export async function fetchInternshipJobs(
  targetRoles?: string,
  locations?: string
): Promise<Job[]> {
  try {
    // Try fetching from Greenhouse API
    // Using a public Greenhouse board (e.g., Airbnb's board as example)
    const response = await fetch(
      'https://boards-api.greenhouse.io/v1/boards/airbnb/jobs?content=true',
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Greenhouse API failed: ${response.status}`);
    }

    const data = await response.json();

    // Filter for intern positions
    const internJobs: Job[] = data.jobs
      ?.filter((job: any) => {
        const title = job.title?.toLowerCase() || '';
        return (
          title.includes('intern') ||
          title.includes('internship') ||
          title.includes('co-op')
        );
      })
      .slice(0, 8) // Take up to 8 jobs
      .map((job: any) => ({
        company: 'Airbnb',
        title: job.title,
        location: job.location?.name || 'Remote',
        url: job.absolute_url,
      })) || [];

    if (internJobs.length > 0) {
      console.log(`✅ Fetched ${internJobs.length} real jobs from Greenhouse API`);
      return internJobs;
    }

    // If no intern jobs found, use fallback
    throw new Error('No intern jobs found');
  } catch (error) {
    console.warn('⚠️ Greenhouse API failed, using fallback data:', error);

    // Use fallback data
    let jobs = [...FALLBACK_JOBS];

    // Simple filtering based on user preferences
    if (targetRoles) {
      const roles = targetRoles.toLowerCase();
      if (roles.includes('ai') || roles.includes('ml')) {
        // Prioritize AI/ML companies
        jobs = jobs.filter(j =>
          j.company.includes('OpenAI') ||
          j.company.includes('Anthropic') ||
          j.company.includes('Scale') ||
          j.title.toLowerCase().includes('ai') ||
          j.title.toLowerCase().includes('ml')
        ).concat(jobs.filter(j =>
          !j.company.includes('OpenAI') &&
          !j.company.includes('Anthropic') &&
          !j.company.includes('Scale')
        ));
      } else if (roles.includes('quant') || roles.includes('trading')) {
        // Prioritize finance companies
        jobs = [jobs.find(j => j.company === 'Jane Street')!, ...jobs.filter(j => j.company !== 'Jane Street')];
      }
    }

    console.log(`✅ Using ${jobs.length} fallback jobs`);
    return jobs.slice(0, 8);
  }
}

/**
 * Fetch from multiple sources and combine
 */
export async function fetchMultiSourceJobs(
  targetRoles?: string,
  locations?: string
): Promise<Job[]> {
  const allJobs: Job[] = [];

  // Try Greenhouse (multiple boards)
  const greenhouseBoards = [
    'airbnb',
    'dropbox',
    'gitlab',
  ];

  for (const board of greenhouseBoards) {
    try {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`,
        {
          signal: AbortSignal.timeout(3000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const internJobs = data.jobs
          ?.filter((job: any) => {
            const title = job.title?.toLowerCase() || '';
            return title.includes('intern') || title.includes('co-op');
          })
          .slice(0, 3)
          .map((job: any) => ({
            company: board.charAt(0).toUpperCase() + board.slice(1),
            title: job.title,
            location: job.location?.name || 'Remote',
            url: job.absolute_url,
          })) || [];

        allJobs.push(...internJobs);
      }
    } catch (error) {
      // Silently continue
    }
  }

  // If we got some jobs, return them
  if (allJobs.length > 0) {
    console.log(`✅ Fetched ${allJobs.length} jobs from multiple Greenhouse boards`);
    return allJobs.slice(0, 10);
  }

  // Otherwise use fallback
  console.log('⚠️ All Greenhouse boards failed, using fallback');
  return fetchInternshipJobs(targetRoles, locations);
}
