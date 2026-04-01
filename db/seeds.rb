statuses = %w[interested applied interviewing offer rejected]
work_styles = %w[full_remote hybrid onsite]
employment_types = %w[full_time contract]
stacks = [
  "Ruby on Rails, TypeScript, React",
  "Go, React, TypeScript",
  "Ruby on Rails, Vue.js",
  "Java, Spring Boot, React",
  "Python, Django, TypeScript"
]
locations = ["東京", "大阪", "福岡", "名古屋", "リモート"]
companies = Array.new(40) { |i| "サンプル会社 #{i + 1}" }
positions = ["バックエンドエンジニア", "フロントエンドエンジニア", "フルスタックエンジニア", "テックリード"]

Job.delete_all

40.times do |i|
  salary_min = 4_500_000 + (i % 8) * 400_000
  salary_max = salary_min + 1_500_000 + (i % 5) * 300_000

  Job.create!(
    company_name: companies[i],
    position: positions[i % positions.length],
    status: statuses[i % statuses.length],
    work_style: work_styles[i % work_styles.length],
    employment_type: employment_types[i % employment_types.length],
    salary_min: salary_min,
    salary_max: salary_max,
    tech_stack: stacks[i % stacks.length],
    location: locations[i % locations.length],
    notes: "選考メモ #{i + 1}: カジュアル面談・面接メモをここに記録。",
    created_at: Time.current - i.days,
    updated_at: Time.current - i.hours
  )
end
