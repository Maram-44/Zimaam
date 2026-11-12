"""Synthetic company: documents, roles, users. No real data."""

DOCS = {
    "HR-SAL": {
        "title": "Salary bands and promotions", "sensitive": True,
        "probe": "executive salary bands bonus and promotion payroll",
        "chunks": [
            "confidential salary bands for every employee grade including executive compensation and bonus",
            "payroll remuneration review and annual promotion list with appraisal results الرواتب والعلاوات",
            "executive pay packages bonus distribution wage income by grade and seniority",
            "promotion criteria compensation adjustments and salary range for management positions",
        ]},
    "HR-HEAD": {
        "title": "Headcount and offices", "sensitive": False,
        "probe": "headcount by department and office locations",
        "chunks": [
            "headcount by department staff distribution and office location statistics",
            "organization chart teams hiring plan and workforce size per site",
            "department staffing levels office locations and open vacancies",
        ]},
    "FIN-REP": {
        "title": "Quarterly finance report", "sensitive": True,
        "probe": "quarterly revenue forecast budget and profit",
        "chunks": [
            "confidential quarterly revenue forecast budget and net profit الميزانية والإيرادات",
            "cashflow treasury expenditure invoices liabilities and assets for the quarter",
            "audit findings financial statements investment plan and budget cuts",
            "profit margin revenue targets and expenditure limits by department",
        ]},
    "SALES-PIPE": {
        "title": "Sales pipeline", "sensitive": False,
        "probe": "sales pipeline deals renewals and quota",
        "chunks": [
            "sales pipeline open deals leads and expected renewals this quarter",
            "customer accounts commission quota and opportunities by territory",
            "renewal targets key accounts and customer relationship notes",
        ]},
    "HANDBOOK": {
        "title": "Employee handbook", "sensitive": False,
        "probe": "leave policy working hours and expense policy",
        "chunks": [
            "leave policy annual leave sick leave and working hours for all employees",
            "expense policy travel reimbursement and it support contacts",
            "code of conduct onboarding checklist and office rules",
        ]},
}

ROLE_DOCS = {
    "hr":      {"HR-SAL", "HR-HEAD", "HANDBOOK"},
    "finance": {"FIN-REP", "HR-HEAD", "HANDBOOK"},
    "sales":   {"SALES-PIPE", "HR-HEAD", "HANDBOOK"},
}

# user -> (role, extra grants). Ahmed (HR) was also given the finance report, to be revoked in the demo.
USERS = {
    "ahmed":   ("hr", {"FIN-REP"}),
    "noura":   ("hr", set()),
    "sara":    ("sales", set()),
    "mohamed": ("finance", set()),
    "khaled":  ("finance", set()),
}
