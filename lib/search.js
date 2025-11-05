
export function buildJobSearchQuery(filters) {
  const query = { status: 'active' };

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { skills: { $in: [searchRegex] } },
    ];
  }

  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }

  if (filters.type && filters.type !== 'all') {
    query.type = filters.type;
  }

  if (filters.experience) {
    query.experience = filters.experience;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minSalary) {
    query['salary.min'] = { $gte: parseInt(filters.minSalary) };
  }

  if (filters.maxSalary) {
    query['salary.max'] = { $lte: parseInt(filters.maxSalary) };
  }

  if (filters.featured === true || filters.featured === 'true') {
    query.featured = true;
  }

  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }

  return query;
}
