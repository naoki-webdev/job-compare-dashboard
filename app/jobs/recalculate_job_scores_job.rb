class RecalculateJobScoresJob < ApplicationJob
  queue_as :default

  def perform(job_ids: nil, user_id: nil)
    scope = Job.all
    scope = scope.where(id: job_ids) unless job_ids.nil?
    scope = scope.where(user_id: user_id) if user_id.present?

    scope.find_each(&:save!)
  end
end
