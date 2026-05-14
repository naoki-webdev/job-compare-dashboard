class ScoringPreference < ApplicationRecord
  belongs_to :user

  validates :user, presence: true
  validates :user_id, uniqueness: true
  validates :full_remote_weight, :hybrid_weight, :onsite_weight, presence: true
  validates :high_salary_max_threshold, :high_salary_bonus, presence: true
  validates :low_salary_min_threshold, :low_salary_penalty, presence: true
  validates :high_salary_max_threshold, :low_salary_min_threshold, numericality: { greater_than_or_equal_to: 0 }

  after_commit :recalculate_job_scores!, on: :update

  def self.current(user:)
    find_or_create_by!(user: user)
  end

  def self.for_calculation(user:)
    find_by(user: user) || new(user: user)
  end

  private

  def recalculate_job_scores!
    RecalculateJobScoresJob.perform_later(user_id: user_id)
  end
end
