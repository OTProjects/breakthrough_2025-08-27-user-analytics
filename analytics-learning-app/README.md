# Analytics Learning App

A comprehensive Next.js application designed to teach product analytics, A/B testing, and user feedback collection through hands-on experience.

## 🎯 What You'll Learn

- **Product Analytics**: Event tracking, funnel analysis, retention metrics, and dashboard interpretation
- **A/B Testing**: Experiment design, statistical significance, and results interpretation
- **User Feedback**: NPS surveys, micro-surveys, bug reporting, and sentiment analysis
- **Privacy & Consent**: GDPR-compliant analytics with user consent management
- **Data Analysis**: Statistical methods for making data-driven product decisions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or download the project
cd analytics-learning-app

# Install dependencies
npm install

# Set up the database
npm run db:push

# Seed with demo data (creates 30 days of realistic usage data)
npm run seed

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to start exploring!

## 🏗️ Architecture Overview

### Core Features
- **Checklists App**: Simple task management with integrated A/B testing
- **Analytics Lab**: Interactive dashboard showing real metrics and insights
- **Feedback System**: Multi-modal feedback collection (NPS, surveys, bug reports)
- **Privacy Controls**: GDPR-compliant consent management

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: SQLite (local development)
- **Analytics**: PostHog integration + local event storage
- **Charts**: Recharts for data visualization
- **Testing**: Playwright for E2E tests

## 📊 Event Schema & Tracking

All events follow a standardized schema defined in `/analytics/event_schema.json`:

```typescript
// Type-safe event tracking
import { track } from '@/lib/analytics'

await track('checklist_create', {
  checklist_id: 'checklist_123',
  title: 'My Todo List',
  items_count: 5,
  experiment_variant: 'smart_hints_on'
})
```

### Key Events Tracked
- `app_open`, `page_view` - Basic usage
- `checklist_create`, `checklist_complete`, `checklist_share` - Core actions
- `feedback_opened`, `feedback_submitted`, `nps_shown`, `nps_scored` - User feedback
- `cta_click` - Call-to-action interactions
- `error` - Error tracking

## 🧪 A/B Testing: Smart Hints Experiment

The app includes a real A/B test comparing checklist completion rates:

- **Control**: Standard checklist creation flow
- **Treatment**: Enhanced flow with smart hints and tips
- **Primary Metric**: Checklist completion rate
- **Secondary Metrics**: Time to complete, return rate, feedback sentiment

### How It Works

1. Users are randomly assigned to control/treatment on first visit
2. Assignment is stored locally and in PostHog for consistency
3. All events include the experiment variant
4. Results are analyzed for statistical significance

```typescript
// Check user's experiment variant
const variant = await getExperimentVariant('smart_hints', userId)

// Show different UI based on variant
{variant === 'treatment' && (
  <SmartHint>💡 Tip: Break down big tasks into smaller steps!</SmartHint>
)}
```

## 💬 Feedback Collection System

### Three Types of Feedback

1. **Micro-Surveys**: Contextual, lightweight feedback after key actions
2. **NPS Surveys**: Net Promoter Score with follow-up questions  
3. **Bug Reports**: Detailed reports with optional screenshots and console logs

### Implementation
- Local throttling prevents survey fatigue
- Screenshots captured using html2canvas
- Console errors automatically attached to bug reports
- All feedback stored locally + sent to PostHog

## 🔒 Privacy & Compliance

- **Consent Banner**: Required before session recording
- **Do Not Track**: Respects browser DNT settings  
- **Data Minimization**: Email addresses are hashed before analytics
- **User Control**: Clear opt-out mechanisms

## 📈 Analytics Dashboard

The `/lab` page provides comprehensive analytics with educational content:

### Charts & Metrics
- **Daily/Weekly Active Users**: Growth and engagement trends
- **Conversion Funnel**: User journey analysis with drop-off points
- **Retention Curve**: Day 1 and Day 7 retention with benchmarks
- **A/B Test Results**: Experiment performance with confidence intervals
- **NPS Distribution**: Customer satisfaction analysis
- **Feedback Word Cloud**: Sentiment analysis and theme extraction

### Educational Elements
Each chart includes:
- "How to read this" explanations
- Industry benchmarks and context
- Common pitfalls to avoid
- Actionable insights and recommendations

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Regenerate Prisma client

# Data & Analytics
npm run seed         # Seed database with 30 days of demo data
npm run simulate     # Generate live traffic for 2 minutes
npm run analyze      # Comprehensive data analysis report

# Testing
npm run test         # Run Playwright E2E tests
npm run lint         # ESLint code quality check
```

## 📚 Learning Exercises

### 30-Minute Analytics Workshop

1. **Explore the Dashboard** (5 min)
   - Run `npm run dev` and visit `/lab`
   - Examine each chart and read the explanations
   - Identify which metrics seem most/least healthy

2. **Interpret the A/B Test** (10 min)
   - Look at the experiment results chart
   - Is the result statistically significant?
   - What would you recommend: ship, kill, or continue testing?
   - What might explain the result (positive or negative)?

3. **Analyze the Funnel** (10 min)
   - Where do most users drop off in the conversion funnel?
   - What could you test to improve the biggest drop-off step?
   - How would you validate your hypothesis?

4. **Make a Product Decision** (5 min)
   - Run `npm run analyze` to see detailed insights
   - Based on all the data, what would you prioritize:
     - Improving onboarding (retention)?
     - Fixing the funnel (conversion)?
     - Growing traffic (acquisition)?
     - Enhancing features (satisfaction)?

### Advanced Exercises

1. **Design Your Own Experiment**
   - Identify a hypothesis to test in the checklist feature
   - Define primary and secondary metrics
   - Estimate required sample size

2. **Improve Event Tracking**
   - Add new events to track user behavior
   - Update the event schema file
   - Implement type-safe tracking

3. **Enhance the Feedback System**
   - Add new survey questions
   - Implement feedback categorization
   - Create alerts for negative feedback

## 📖 Key Analytics Concepts

### Funnel Analysis
- **Definition**: Tracking user progression through a series of steps
- **Best Practice**: Focus on the biggest drop-off point first
- **Common Issues**: Too many steps, unclear value proposition, poor UX

### Retention Analysis  
- **Day 1 Retention**: Critical for predicting long-term success
- **Cohort Analysis**: Compare different user groups over time
- **Benchmarks**: Varies by industry (social: 25%, productivity: 15%, games: 40%)

### A/B Testing
- **Statistical Significance**: Need 95%+ confidence before making decisions
- **Sample Size**: Use power analysis to determine required users
- **Duration**: Run for at least one full business cycle
- **Multiple Testing**: Adjust for multiple comparisons to avoid false positives

### NPS (Net Promoter Score)
- **Calculation**: (% Promoters) - (% Detractors)
- **Scale**: -100 to +100, where >50 is excellent
- **Segmentation**: Look at NPS by user type, feature usage, etc.

## 🚫 Common Analytics Mistakes

1. **Vanity Metrics**: Tracking metrics that don't drive decisions
2. **HARKing**: Hypothesizing After Results are Known  
3. **Simpson's Paradox**: Aggregated data showing opposite trends
4. **Survivorship Bias**: Only analyzing retained users
5. **Correlation ≠ Causation**: Confusing correlation with causal relationships

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in your PostHog credentials:

```bash
# PostHog Configuration (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_API_KEY=your_project_api_key
POSTHOG_PERSONAL_API_KEY=your_personal_api_key

# Database
DATABASE_URL="file:./dev.db"
```

**Note**: The app works perfectly without PostHog - all analytics are stored locally in SQLite.

### Switching to Live PostHog Data

1. Add your PostHog API keys to `.env`
2. Visit `/lab` and toggle to "PostHog API" mode
3. Your events will be sent to both local database and PostHog

## 🎛️ Customization

### Adding New Events

1. Update `/analytics/event_schema.json` with your event definition
2. Add the schema to `/lib/analytics.ts`
3. Use type-safe tracking: `track('your_event', { ... })`

### Adding New Charts

1. Create a new component in `/components/charts/`
2. Add data fetching logic to `/app/api/analytics/route.ts`
3. Include in the `/lab` dashboard

### Modifying the A/B Test

1. Update experiment logic in `/lib/flags.ts`
2. Modify UI variations in `/app/checklists/page.tsx`
3. Adjust analysis in `/scripts/analyze.ts`

## 🧪 Testing

Run the E2E tests to ensure everything works:

```bash
npm run test
```

The tests cover:
- Basic app functionality
- Event tracking verification  
- Feedback submission flows
- A/B test variant assignment

## 🤝 Contributing

This is an educational project. Feel free to:
- Add new analytics concepts
- Improve the documentation
- Enhance the visualizations
- Add more realistic demo data

## 📄 License

MIT License - feel free to use this for learning and teaching!

---

## 🎓 What's Next?

After completing this tutorial, you'll have hands-on experience with:
- ✅ Event-based analytics tracking
- ✅ A/B testing implementation and analysis  
- ✅ User feedback collection and analysis
- ✅ Building analytics dashboards
- ✅ Making data-driven product decisions

### Recommended Next Steps:
1. **Advanced Statistics**: Learn about Bayesian A/B testing, multi-armed bandits
2. **Product Metrics**: Explore North Star metrics, OKRs, and metric trees
3. **Data Infrastructure**: Study event streaming, data warehouses, and pipelines
4. **Machine Learning**: Apply ML to user segmentation and churn prediction

Happy learning! 🚀