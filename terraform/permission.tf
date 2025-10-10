# Jérémie perms

resource "google_project_iam_member" "jeremie" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "user:jeremie@jjaouen.com"
}

resource "google_project_iam_member" "iam_viewer_jeremie" {
  project = var.project_id
  role    = "roles/iam.securityReviewer"
  member  = "user:jeremie@jjaouen.com"
}

resource "google_billing_account_iam_member" "billing_viewer_jeremie" {
  billing_account_id = "017F58-B59953-FDD590"
  role               = "roles/billing.viewer"
  member             = "user:jeremie@jjaouen.com"
}
