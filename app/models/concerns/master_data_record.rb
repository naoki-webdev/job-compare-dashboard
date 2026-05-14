module MasterDataRecord
  extend ActiveSupport::Concern

  included do
    validates :name, presence: true, uniqueness: true
    validates :score_weight, :display_order, presence: true

    scope :active, -> { where(active: true) }
    scope :ordered, -> { order(:display_order, :id) }

    after_commit :refresh_jobs!, on: :update, if: :saved_change_to_score_weight?
  end

  private

  def refresh_jobs!
    job_ids = jobs_for_score_refresh.distinct.pluck(:id)
    RecalculateJobScoresJob.perform_later(job_ids: job_ids) if job_ids.any?
  end

  def jobs_for_score_refresh
    jobs
  end
end
