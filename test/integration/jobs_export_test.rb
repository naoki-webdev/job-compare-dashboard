require "test_helper"
require "csv"

class JobsExportTest < ActionDispatch::IntegrationTest
  test "export returns localized csv with utf-8 bom" do
    Job.create!(
      company_name: "サンプル会社 1",
      position: "バックエンドエンジニア",
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 4_500_000,
      salary_max: 6_000_000,
      tech_stack: "Ruby on Rails",
      location: "東京",
      notes: "候補メモ"
    )

    get "/api/jobs/export"

    assert_response :success
    assert_equal "text/csv; charset=utf-8", response.media_type + "; charset=" + response.charset
    assert_match(/\A\uFEFF/, response.body)

    csv = CSV.parse(response.body.delete_prefix("\uFEFF"), headers: true)

    assert_equal "会社名", csv.headers[1]
    assert_equal "選考ステータス", csv.headers[3]
    assert_equal "働き方", csv.headers[4]
    assert_equal "雇用形態", csv.headers[5]

    row = csv.first
    assert_equal "サンプル会社 1", row["会社名"]
    assert_equal "バックエンドエンジニア", row["職種"]
    assert_equal "気になる", row["選考ステータス"]
    assert_equal "フルリモート", row["働き方"]
    assert_equal "正社員", row["雇用形態"]
    assert_equal "東京", row["勤務地"]
    assert_equal "候補メモ", row["メモ"]
  end
end
