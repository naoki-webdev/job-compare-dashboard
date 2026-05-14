require "test_helper"

class JobDraftsApiTest < ActionDispatch::IntegrationTest
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all
    PositiveKeyword.delete_all
    NegativeKeyword.delete_all
    InterviewQuestion.delete_all
    ActivityLog.delete_all
    User.delete_all

    @user = create_user(email: "drafts@example.com")
    @headers = auth_headers(@user)

    Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    Location.create!(name: "リモート", score_weight: 12, active: true, display_order: 1)
    TechStack.create!(name: "React", score_weight: 8, active: true, display_order: 0)
    TechStack.create!(name: "TypeScript", score_weight: 15, active: true, display_order: 1)
    @user.positive_keywords.create!(pattern: "React", label: "React を使う開発", active: true, display_order: 0)
    @user.negative_keywords.create!(pattern: "業務範囲", label: "業務範囲を確認", active: true, display_order: 0)
    @user.interview_questions.create!(body: "チーム体制と役割分担", active: true, display_order: 0)
  end

  test "create returns rule-based draft and insights" do
    post "/api/job_drafts",
      params: {
        job_draft: {
          mode: "rule",
          url: "https://example.com/job/1",
          text: "株式会社サンプル\n年収700万〜900万\n勤務地: 東京（フルリモート可）\n必須スキル: React / TypeScript\n業務範囲の確認が必要"
        }
      },
      headers: @headers,
      as: :json

    assert_response :success

    body = JSON.parse(response.body)
    draft = body["draft"]
    insights = body["insights"]

    assert_equal "rule", body["mode"]
    assert_equal "full_remote", draft["work_style"]
    assert_equal 7_000_000, draft["salary_min"]
    assert_equal 9_000_000, draft["salary_max"]
    assert_equal "https://example.com/job/1", draft["source_url"]
    assert_includes draft["tech_stack_names"], "React"
    assert_includes draft["tech_stack_names"], "TypeScript"
    assert_equal "東京", draft["location_name"]
    assert insights["score_estimate"].is_a?(Integer)
    assert_includes insights["pros"], "React を使う開発"
    assert_includes insights["cons"], "業務範囲を確認"
    assert_equal [ "チーム体制と役割分担" ], insights["questions"]
  end

  test "create returns empty insights when the current user has no evaluation masters" do
    @user.positive_keywords.delete_all
    @user.negative_keywords.delete_all
    @user.interview_questions.delete_all

    post "/api/job_drafts",
      params: {
        job_draft: {
          mode: "rule",
          url: "",
          text: "株式会社サンプル\nReact 業務範囲 フルリモート"
        }
      },
      headers: @headers,
      as: :json

    assert_response :success

    insights = JSON.parse(response.body)["insights"]
    assert_nil insights["score_estimate"]
    assert_empty insights["pros"]
    assert_empty insights["cons"]
    assert_empty insights["questions"]
  end

  test "create does not use another user's evaluation masters" do
    other_user = create_user(email: "other-drafts@example.com")
    other_user.positive_keywords.create!(pattern: "React", label: "別ユーザーのReact評価", active: true, display_order: 0)
    other_user.negative_keywords.create!(pattern: "業務範囲", label: "別ユーザーの業務範囲評価", active: true, display_order: 0)
    @user.positive_keywords.delete_all
    @user.negative_keywords.delete_all
    @user.interview_questions.delete_all

    post "/api/job_drafts",
      params: { job_draft: { mode: "rule", url: "", text: "React 業務範囲" } },
      headers: @headers,
      as: :json

    assert_response :success
    insights = JSON.parse(response.body)["insights"]
    assert_empty insights["pros"]
    assert_empty insights["cons"]
  end

  test "ai-enabled user falls back to rule when GEMINI_API_KEY is missing" do
    @user.update!(ai_enabled: true)
    ENV.delete("GEMINI_API_KEY")

    post "/api/job_drafts",
      params: { job_draft: { mode: "ai", url: "", text: "年収500万 勤務地リモート" } },
      headers: auth_headers(@user),
      as: :json

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal "rule", body["mode"]
    assert_equal false, body["ai_available"]
  end

  test "read-only demo user cannot use the endpoint" do
    @user.update!(read_only: true)

    post "/api/job_drafts",
      params: { job_draft: { mode: "rule", url: "", text: "本文" } },
      headers: auth_headers(@user),
      as: :json

    assert_response :forbidden
  end

  test "non-master user requesting ai mode is forced to rule mode" do
    # default user has ai_enabled=false
    ENV["GEMINI_API_KEY"] = "test-key-should-not-be-used"

    post "/api/job_drafts",
      params: { job_draft: { mode: "ai", url: "", text: "年収500万 勤務地リモート" } },
      headers: @headers,
      as: :json

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal "rule", body["mode"]
  ensure
    ENV.delete("GEMINI_API_KEY")
  end

  test "read-only user requesting ai mode is rejected before extraction" do
    @user.update!(read_only: true)
    ENV["GEMINI_API_KEY"] = "test-key-should-not-be-used"

    post "/api/job_drafts",
      params: { job_draft: { mode: "ai", url: "", text: "本文" } },
      headers: auth_headers(@user),
      as: :json

    assert_response :forbidden
  ensure
    ENV.delete("GEMINI_API_KEY")
  end

  test "rejects text that exceeds the maximum length" do
    post "/api/job_drafts",
      params: { job_draft: { mode: "rule", url: "", text: "a" * 8_001 } },
      headers: @headers,
      as: :json

    assert_response :unprocessable_entity
    body = JSON.parse(response.body)
    assert_match(/8000/, body["errors"].first)
  end

  test "rejects empty text" do
    post "/api/job_drafts",
      params: { job_draft: { mode: "rule", url: "", text: "   " } },
      headers: @headers,
      as: :json

    assert_response :unprocessable_entity
  end

  test "unauthenticated request is rejected" do
    post "/api/job_drafts",
      params: { job_draft: { mode: "rule", url: "", text: "本文" } },
      as: :json

    assert_response :unauthorized
  end
end
