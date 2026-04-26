class Job < ApplicationRecord
  belongs_to :position
  belongs_to :location
  has_many :job_tech_stacks, dependent: :destroy
  has_many :tech_stacks, -> { ordered }, through: :job_tech_stacks
  has_one_attached :company_logo

  enum :status, {
    interested: "interested",
    applied: "applied",
    interviewing: "interviewing",
    offer: "offer",
    rejected: "rejected"
  }, validate: true

  enum :work_style, {
    full_remote: "full_remote",
    hybrid: "hybrid",
    onsite: "onsite"
  }, validate: true

  enum :employment_type, {
    full_time: "full_time",
    contract: "contract"
  }, validate: true

  validates :company_name, presence: true
  validates :position, presence: true
  validates :status, presence: true
  validates :work_style, presence: true
  validates :employment_type, presence: true
  validates :salary_min, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :salary_max, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :salary_max, numericality: { greater_than_or_equal_to: :salary_min }
  validates :tech_stacks, presence: true
  validates :location, presence: true
  validate :company_logo_must_be_image
  validate :company_logo_must_be_small_enough

  before_validation :set_score

  delegate :name, to: :position, prefix: true, allow_nil: true
  delegate :name, to: :location, prefix: true, allow_nil: true

  def tech_stack_names
    tech_stacks.map(&:name).join(", ")
  end

  private

  def company_logo_must_be_image
    return unless company_logo.attached?
    return if company_logo.blob.content_type.to_s.start_with?("image/")

    errors.add(:company_logo, "must be an image")
  end

  def company_logo_must_be_small_enough
    return unless company_logo.attached?
    return if company_logo.blob.byte_size <= 5.megabytes

    errors.add(:company_logo, "must be 5MB or smaller")
  end

  def set_score
    self.score = calculated_score
  end

  def calculated_score
    preference = ScoringPreference.current
    total = 0

    total += preference.full_remote_weight if full_remote?
    total += preference.hybrid_weight if hybrid?
    total += preference.onsite_weight if onsite?

    total += position&.score_weight.to_i
    total += location&.score_weight.to_i
    total += tech_stacks.map(&:score_weight).sum

    total += preference.high_salary_bonus if salary_max.to_i >= preference.high_salary_max_threshold
    total += preference.low_salary_penalty if salary_min.to_i < preference.low_salary_min_threshold

    total
  end
end
