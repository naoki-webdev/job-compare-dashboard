class CreateJobs < ActiveRecord::Migration[8.0]
  def change
    create_enum :job_status, %w[interested applied interviewing offer rejected]
    create_enum :job_work_style, %w[full_remote hybrid onsite]
    create_enum :job_employment_type, %w[full_time contract]

    create_table :jobs do |t|
      t.string :company_name, null: false
      t.string :position, null: false
      t.enum :status, enum_type: :job_status, null: false, default: "interested"
      t.enum :work_style, enum_type: :job_work_style, null: false, default: "hybrid"
      t.enum :employment_type, enum_type: :job_employment_type, null: false, default: "full_time"
      t.integer :salary_min, null: false, default: 0
      t.integer :salary_max, null: false, default: 0
      t.string :tech_stack, null: false, default: ""
      t.string :location, null: false, default: ""
      t.text :notes, null: false, default: ""
      t.integer :score, null: false, default: 0

      t.timestamps
    end

    add_index :jobs, :status
    add_index :jobs, :work_style
    add_index :jobs, :score
    add_index :jobs, :created_at
  end
end
