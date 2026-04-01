# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_04_02_190000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "jobs", force: :cascade do |t|
    t.string "company_name", null: false
    t.string "position", null: false
    t.string "status", default: "interested", null: false
    t.string "work_style", default: "hybrid", null: false
    t.string "employment_type", default: "full_time", null: false
    t.integer "salary_min", default: 0, null: false
    t.integer "salary_max", default: 0, null: false
    t.string "tech_stack", default: "", null: false
    t.string "location", default: "", null: false
    t.text "notes", default: "", null: false
    t.integer "score", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_jobs_on_created_at"
    t.index ["score"], name: "index_jobs_on_score"
    t.index ["status"], name: "index_jobs_on_status"
    t.index ["work_style"], name: "index_jobs_on_work_style"
  end

  create_table "scoring_preferences", force: :cascade do |t|
    t.integer "full_remote_weight", default: 30, null: false
    t.integer "hybrid_weight", default: 15, null: false
    t.integer "onsite_weight", default: -30, null: false
    t.integer "rails_weight", default: 20, null: false
    t.integer "typescript_weight", default: 15, null: false
    t.integer "high_salary_max_threshold", default: 8000000, null: false
    t.integer "high_salary_bonus", default: 10, null: false
    t.integer "low_salary_min_threshold", default: 4000000, null: false
    t.integer "low_salary_penalty", default: -10, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
