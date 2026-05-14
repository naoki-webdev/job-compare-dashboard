work_styles = %w[full_remote hybrid onsite]
employment_types = %w[full_time contract]
companies = Array.new(40) { |i| "サンプル会社 #{i + 1}" }
demo_email = Rails.application.config.x.demo_account.email
demo_password = Rails.application.config.x.demo_account.password

position_definitions = [
  { name: "バックエンドエンジニア", score_weight: 8, display_order: 0 },
  { name: "フロントエンドエンジニア", score_weight: 5, display_order: 1 },
  { name: "フルスタックエンジニア", score_weight: 10, display_order: 2 },
  { name: "テックリード", score_weight: 15, display_order: 3 }
]

tech_stack_definitions = [
  { name: "Ruby on Rails", score_weight: 20, display_order: 0 },
  { name: "TypeScript", score_weight: 15, display_order: 1 },
  { name: "React", score_weight: 8, display_order: 2 },
  { name: "Go", score_weight: 6, display_order: 3 },
  { name: "Vue.js", score_weight: 5, display_order: 4 },
  { name: "Spring Boot", score_weight: 4, display_order: 5 },
  { name: "Python", score_weight: 4, display_order: 6 },
  { name: "Django", score_weight: 4, display_order: 7 }
]

location_definitions = [
  { name: "東京", score_weight: 6, display_order: 0 },
  { name: "大阪", score_weight: 4, display_order: 1 },
  { name: "福岡", score_weight: 3, display_order: 2 },
  { name: "名古屋", score_weight: 2, display_order: 3 },
  { name: "リモート", score_weight: 12, display_order: 4 }
]

job_stack_sets = [
  [ "Ruby on Rails", "TypeScript", "React" ],
  [ "Go", "React", "TypeScript" ],
  [ "Ruby on Rails", "Vue.js" ],
  [ "Spring Boot", "React" ],
  [ "Python", "Django", "TypeScript" ]
]

JobTechStack.delete_all
Job.delete_all
ScoringPreference.delete_all
ActivityLog.delete_all
PositiveKeyword.delete_all
NegativeKeyword.delete_all
InterviewQuestion.delete_all
User.delete_all
Location.delete_all
Position.delete_all
TechStack.delete_all

demo_user = User.create!(
  name: "デモユーザー",
  email: demo_email,
  password: demo_password,
  password_confirmation: demo_password,
  read_only: true,
  ai_enabled: false
)

# 通常ユーザー: E2E / 開発用。public な credentials なので本番 (production) には絶対に作らない。
# 本番デモは demo user (read_only=true) のみ存在し、書き込みは API 層で 403。
e2e_user =
  if Rails.env.development? || Rails.env.test?
    user = User.create!(
      name: "テストユーザー",
      email: "e2e@example.com",
      password: "password",
      password_confirmation: "password",
      read_only: false,
      ai_enabled: false
    )
    ScoringPreference.create!(
      user: user,
      full_remote_weight: 30,
      hybrid_weight: 15,
      onsite_weight: 0,
      high_salary_max_threshold: 8_000_000,
      high_salary_bonus: 10,
      low_salary_min_threshold: 4_000_000,
      low_salary_penalty: -10
    )
    user
  end

locations = location_definitions.map do |attributes|
  Location.create!(attributes.merge(active: true))
end

positions = position_definitions.map do |attributes|
  Position.create!(attributes.merge(active: true))
end

tech_stacks = tech_stack_definitions.map do |attributes|
  TechStack.create!(attributes.merge(active: true))
end.index_by(&:name)

ScoringPreference.create!(
  user: demo_user,
  full_remote_weight: 30,
  hybrid_weight: 15,
  onsite_weight: 0,
  high_salary_max_threshold: 8_000_000,
  high_salary_bonus: 10,
  low_salary_min_threshold: 4_000_000,
  low_salary_penalty: -10
)

[ demo_user, e2e_user ].compact.each do |owner|
  [
    { pattern: "フルリモート", label: "リモート前提で働ける", display_order: 0 },
    { pattern: "React", label: "React を使う開発", display_order: 1 },
    { pattern: "TypeScript", label: "TypeScript を使う開発", display_order: 2 },
    { pattern: "自社サービス", label: "自社サービス開発", display_order: 3 }
  ].each do |attributes|
    owner.positive_keywords.create!(attributes.merge(active: true))
  end

  [
    { pattern: "業務範囲", label: "業務範囲を確認", display_order: 0 },
    { pattern: "チーム体制", label: "チーム体制を確認", display_order: 1 },
    { pattern: "評価制度", label: "評価制度を確認", display_order: 2 }
  ].each do |attributes|
    owner.negative_keywords.create!(attributes.merge(active: true))
  end

  [
    { body: "チーム体制と役割分担", display_order: 0 },
    { body: "オンボーディングの流れ", display_order: 1 },
    { body: "評価制度と期待値", display_order: 2 }
  ].each do |attributes|
    owner.interview_questions.create!(attributes.merge(active: true))
  end

  40.times do |i|
    salary_min = 4_500_000 + (i % 8) * 400_000
    salary_max = salary_min + 1_500_000 + (i % 5) * 300_000
    stack_names = job_stack_sets[i % job_stack_sets.length]
    status = case i % 10
    when 0, 1, 2, 3
      "interested"
    when 4, 5, 6
      "applied"
    when 7, 8
      "interviewing"
    when 9
      i.even? ? "offer" : "rejected"
    end

    job = Job.new(
      user: owner,
      company_name: companies[i],
      position: positions[i % positions.length],
      status: status,
      work_style: work_styles[i % work_styles.length],
      employment_type: employment_types[i % employment_types.length],
      salary_min: salary_min,
      salary_max: salary_max,
      location: locations[i % locations.length],
      notes: "選考メモ #{i + 1}: カジュアル面談・面接メモをここに記録。",
      created_at: Time.current - i.days,
      updated_at: Time.current - i.hours
    )
    job.tech_stacks = stack_names.map { |name| tech_stacks.fetch(name) }
    job.save!
  end
end
