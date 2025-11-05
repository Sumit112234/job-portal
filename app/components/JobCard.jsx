export default function JobCard({ job, onSave, isSaved }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company.name}</p>
        </div>
        <button onClick={() => onSave(job._id)}>
          {isSaved ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>📍 {job.location}</p>
        <p>💰 {formatSalary(job.salary.min, job.salary.max)}</p>
        <p>⏰ {job.type}</p>
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        {job.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {skill}
          </span>
        ))}
      </div>
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Apply Now
      </button>
    </div>
  );
}