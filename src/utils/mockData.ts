
export interface Meeting {
  id: string;
  title: string;
  date: string;
  summary?: string;
  actionItems?: string[];
  transcript?: string;
}

export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Marketing Strategy Meeting",
    date: "2025-04-15T10:00:00",
    summary: "The marketing team discussed the Q2 campaign strategy focusing on digital channels. Budget allocation for social media was increased by 15%. Team agreed to launch the new campaign on May 1st.",
    actionItems: [
      "Sarah to finalize social media calendar by April 22",
      "John to coordinate with design team for new assets",
      "Maria to prepare budget allocation report",
      "Team to reconvene on April 25 for final review"
    ],
    transcript: "Meeting started at 10:00 AM.\n\nJane: Good morning everyone! Today we're discussing our Q2 marketing strategy.\n\nMark: I've prepared an analysis of our Q1 performance. Digital channels outperformed traditional media by 24%.\n\nSarah: Based on that data, I suggest we increase our social media budget by at least 15%.\n\nJohn: I agree. The design team can create new assets specifically optimized for each platform.\n\nMaria: From a budget perspective, that's feasible. I can adjust our allocations.\n\nJane: Great! Let's aim to launch the new campaign on May 1st. Sarah, can you prepare the social calendar?\n\nSarah: Yes, I'll have it ready by April 22nd.\n\nJane: Perfect. Let's meet again on April 25th for a final review. Meeting adjourned."
  },
  {
    id: "2",
    title: "Product Development Sync",
    date: "2025-04-16T14:30:00",
    summary: "The product team reviewed current development milestones. Frontend development is ahead of schedule, but backend integration is experiencing delays. Team decided to allocate additional resources to backend development to meet the May 15 release deadline.",
    actionItems: [
      "Alex to provide daily updates on backend progress",
      "Lisa to coordinate with QA team for early testing",
      "Dev team to implement the requested API changes by April 25",
      "Management to approve additional developer allocation by tomorrow"
    ],
    transcript: "Meeting started at 2:30 PM.\n\nDavid: Welcome everyone. Let's start with status updates.\n\nAlex: Backend integration is behind schedule due to unexpected API complexity.\n\nSophia: Frontend development is actually ahead of schedule. We've completed the dashboard redesign.\n\nLisa: QA is ready to start testing the completed components.\n\nDavid: What do we need to get back on track?\n\nAlex: We need at least one more experienced developer on the backend team.\n\nDavid: I'll speak with management about reallocating resources. Can we still hit our May 15 deadline?\n\nAlex: With additional help, yes. I'll provide daily progress updates.\n\nDavid: Good. Lisa, please coordinate with QA to start testing the frontend components early.\n\nLisa: Will do.\n\nDavid: Let's adjourn and meet again on Friday for a follow-up."
  },
  {
    id: "3",
    title: "Quarterly Financial Review",
    date: "2025-04-17T09:00:00",
    summary: "The finance team presented Q1 results, showing 12% revenue growth year-over-year. Expenses increased by 7%, resulting in improved profit margins. Team identified cost-saving opportunities in operations and IT infrastructure.",
    actionItems: [
      "Robert to prepare detailed cost-saving proposal by April 30",
      "Jennifer to update annual forecast with new projections",
      "Michael to schedule meetings with department heads to discuss budget adjustments",
      "Finance team to distribute updated reports by end of week"
    ],
    transcript: "Meeting started at 9:00 AM.\n\nRobert: Good morning. I'll be presenting our Q1 financial results today.\n\nJennifer: Before we start, I've shared the spreadsheets with everyone.\n\nRobert: Thanks. Overall, we're seeing positive trends. Revenue is up 12% compared to Q1 last year.\n\nMichael: That's excellent. How are expenses tracking?\n\nRobert: Expenses increased by 7%, which gives us improved profit margins compared to last year.\n\nJennifer: I've identified some potential cost-saving opportunities in operations and IT.\n\nMichael: Let's explore those further. Can you prepare a detailed proposal?\n\nRobert: I can have that ready by the end of the month.\n\nMichael: Great. Jennifer, please update our annual forecast with these new projections.\n\nJennifer: Will do. I'll also distribute the updated reports to everyone by the end of this week.\n\nMichael: Excellent. Any questions before we adjourn?"
  }
];
