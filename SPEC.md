# Timor-Leste Payroll System Specification

## Overview

Web-based payroll system for businesses operating in Timor-Leste. Browser access only (no native apps initially).

---

## Legal Requirements Summary

### Minimum Wage
- **Rate**: USD $115/month (unchanged since 2012)
- System must validate no full-time salary falls below this

### Working Hours & Overtime
| Type | Limit | Pay Rate |
|------|-------|----------|
| Standard day | 8 hours | 100% |
| Standard week | 44 hours | 100% |
| Overtime (regular day) | Max 4hr/day, 16hr/week | **+50%** |
| Overtime (rest day/holiday) | Emergency only | **+100%** (double) |
| Night work (9pm-6am) | - | **+25%** |

### Leave Entitlements
| Leave Type | Duration | Pay Rate | Notes |
|------------|----------|----------|-------|
| Annual | 12 days/year | 100% | Prorated ~1 day/month first year |
| Sick | 6 days + 6 days | 100% then 50% | Requires medical cert |
| Maternity | 12 weeks | 100% | 10 weeks must be post-birth |
| Paternity | 5 days | 100% | Following birth |
| Personal/Cultural | 3 days/year | 100% | Marriage, funeral, ceremonies |

### Public Holidays
- **Count**: ~17 per year
- No automatic substitute day if holiday falls on weekend
- Work on holiday = double pay (+100%)
- Must maintain updateable holiday calendar

### Termination & Severance

**Notice Periods (economic/redundancy termination):**
- ≤2 years service: 15 days
- >2 years service: 30 days

**Severance Pay (involuntary, no-fault termination):**
| Tenure | Payment |
|--------|---------|
| 3-12 months | 30 days salary |
| 1-2 years | 60 days salary |
| 2-3 years | 90 days salary |
| >3 years | 120 days (4 months) |

**No severance** for disciplinary termination (just cause).

---

## Tax System

### Wage Income Tax (WIT)

**Resident Employees** (≥183 days/year in TL):
- First $500/month: **0%** (tax-free)
- Above $500/month: **10%** flat

**Non-Resident Employees:**
- All wages: **10%** flat (no exemption)

### Withholding Rules
- Employer MUST withhold and remit
- Calculate per month (not annualized)
- $500 exemption applies each month separately

### Filing Deadlines
| Filing | Deadline | Notes |
|--------|----------|-------|
| Monthly WIT payment | 15th of following month | Via bank deposit with form |
| Annual employer report | March 31 | Summary of all WIT withheld |
| Employee tax certificates | End of Jan or with final payslip | Annual statement for each employee |

---

## Social Security (INSS)

Established 2017 under Law No. 12/2016.

### Contribution Rates
| Party | Rate |
|-------|------|
| Employer | **6%** of gross |
| Employee | **4%** of gross (withheld) |
| **Total** | **10%** |

### Contributory Wage Base
**Included:**
- Base salary
- Regular/permanent allowances
- Fixed bonuses
- 13th month (if paid)
- Night shift premiums

**Excluded:**
- Overtime pay
- Meal/travel allowances
- Sporadic subsidies

### Small Employer Concession (through 2026)
Employers with ≤10 workers (60%+ Timorese):
- 2025: Pay 90% of employer rate (5.4% instead of 6%)
- 2026: Full rate (concession ends)

### Filing
- Monthly remuneration declaration by **15th of following month**
- Currently uses Excel templates from INSS website
- No API available yet

---

## Compliance Calendar

```
Monthly (by 15th):
├── Pay previous month's WIT to Tax Authority
├── Submit monthly tax form
├── Pay INSS contributions (10%)
└── Submit INSS monthly declaration

Annually:
├── March 31: Annual employer WIT report
├── Jan/Dec: Issue employee tax certificates
└── Update public holiday calendar
```

---

## Localization Requirements

### Currency
- **USD** only (official currency)
- Format: $X,XXX.XX (US standard)
- No exchange rate handling needed

### Date Format
- **dd/mm/yyyy** (European/Portuguese style)

### Languages (Priority Order)
1. **Tetum** - National language, most employees
2. **Portuguese** - Official, legal documents
3. **English** - Business, expat users

System should support:
- Switchable UI language
- Bilingual payslips (selectable)
- Portuguese/Tetum terms for statutory items

### Key Terms Translation
| English | Portuguese | Tetum |
|---------|------------|-------|
| Gross Salary | Salário Bruto | Saláriu Brutu |
| Net Salary | Salário Líquido | Saláriu Líkidu |
| Wage Tax | Imposto sobre Salários | Impostu ba Saláriu |
| Social Security | Segurança Social | Seguransa Sosial |
| Overtime | Horas Suplementares | Oras Suplementár |
| Annual Leave | Férias Anuais | Férias Anuál |

### Timezone
- **GMT+9** (no daylight savings)

### Fiscal Year
- Calendar year (Jan 1 - Dec 31)

---

## Government Digital Systems

### e-Tax Portal
- URL: e-tax.mof.gov.tl
- Online filing available but adoption is low
- No public API documented
- System should generate compliant form output (PDF/printable)

### INSS Portal
- URL: segurancasocial.gov.tl
- Excel templates for declarations
- No API - manual submission required
- System should auto-populate official template format

### Future-Proofing
- Design for eventual API integration
- Store data in formats compatible with government templates
- Track regulatory changes (min wage, rates, etc.)

---

## Payslip Requirements

Must include:
- Company name and details
- Employee name, ID, TIN, INSS number
- Pay period
- Gross salary breakdown (base + allowances + overtime)
- Deductions (WIT, INSS employee share)
- Net pay
- Leave balances (recommended)

---

## Tech Stack

### Chosen Stack: Next.js + Supabase

**Frontend:**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Lucide React icons
- next-intl for i18n (Tetum/Portuguese/English)

**Backend:**
- Supabase (PostgreSQL + Auth + APIs)
- Project: `timor-payroll` (huxapokxcawfaelkdcfw)
- Region: ap-southeast-1 (Singapore)

**Database Tables:**
- `organizations` - Company details, INSS reduction eligibility
- `employees` - Staff records, TIN, INSS numbers
- `payroll_runs` - Monthly payroll batches
- `payroll_items` - Individual pay calculations
- `leave_balances` - Annual leave tracking
- `public_holidays` - Holiday calendar (seeded 2025-2026)
- `tax_filings` - WIT monthly reports
- `inss_filings` - Social security monthly reports

### Key Features to Build

1. **Employee Management**
   - Personal details, TIN, INSS number
   - Contract details, salary, employment type
   - Leave balances

2. **Payroll Processing**
   - Monthly pay run
   - Overtime calculation engine
   - Tax calculation (WIT with $500 exemption)
   - INSS contribution calculation
   - Net pay computation

3. **Leave Management**
   - Track entitlements by type
   - Accrual calculations
   - Approval workflow

4. **Reporting/Compliance**
   - Monthly WIT report (government format)
   - Monthly INSS declaration (Excel format)
   - Annual employer WIT summary
   - Employee tax certificates
   - Payslips (PDF, multilingual)

5. **Holiday Calendar**
   - Configurable public holidays
   - Auto-detect work on holidays for pay calculation

6. **Termination Calculator**
   - Notice period calculation
   - Severance pay calculation
   - Final pay computation

7. **Audit Trail**
   - All changes logged
   - 5-year data retention minimum

---

## Current Market Gap

**Existing Solutions:**
- Most use Excel spreadsheets
- Generic tools (QuickBooks, Xero) not localized for TL
- Global EOR services expensive (Papaya, Remote)
- No dedicated local software

**Opportunity:**
- Affordable, localized solution
- Reduce manual errors
- Built-in compliance rules
- Multilingual support

---

## MVP Scope

### Phase 1: Core Payroll
- [x] Project setup (Next.js + Supabase)
- [x] Database schema created
- [x] Payroll calculation engine
- [x] i18n translations (EN/PT/TET)
- [ ] Employee CRUD
- [ ] Monthly pay calculation UI
- [ ] Payslip generation (PDF)
- [ ] Basic dashboard

### Phase 2: Compliance
- [ ] Government form generation (WIT/INSS)
- [ ] Leave management
- [ ] Holiday calendar management
- [ ] Deadline reminders/notifications

### Phase 3: Advanced
- [ ] Employee self-service portal
- [ ] Bank payment file generation
- [ ] Multi-company support
- [ ] API for integrations
- [ ] Authentication & roles

---

## References

- Timor-Leste Labour Code, Law No. 4/2012
- Social Security Law No. 12/2016
- Autoridade Tributária de Timor-Leste (Tax Authority)
- TradeInvest Timor-Leste factsheets
- INSS official guidance
