export type Conference = {
  year: string;
  theme: string;
  tagline: string;
  date: string;
  shortDate: string;
  location: string;
  summary: string;
  description: string;
  scripture?: string;
  scriptureText?: string;
  registrationUrl?: string;
  image: string;
  highlights: string[];
  schedule: Array<{
    time: string;
    title: string;
  }>;
  speakers: Array<{
    name: string;
    role: string;
  }>;
};

export const conferences: Conference[] = [
  {
    year: "2026",
    theme: "The Comforter",
    tagline: "Pure worship, deliverance, and spiritual renewal in the presence of the Holy Spirit.",
    date: "October 9-10, 2026",
    shortDate: "Oct 9-10, 2026",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "Shalom 2026 gathers students and young adults for pure worship, deliverance, and spiritual renewal.",
    description:
      "The Comforter is a two-day Shalom Conference centered on John 14:26-27 and the ministry of the Holy Spirit. Expect undistracted worship, deliverance, prayer, teaching, and space for spiritual renewal as God draws near.",
    scripture: "John 14:26-27",
    scriptureText:
      "But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance. Peace I leave with you, my peace I give unto you.",
    registrationUrl: "https://example.com/register",
    image: "/images/worship.png",
    highlights: [
      "Pure worship",
      "Teaching on the Comforter",
      "Deliverance and prayer ministry",
      "Spiritual renewal for students and young adults",
    ],
    schedule: [
      { time: "Fri 7:00 PM", title: "Opening Night: Worship & Prayer" },
      { time: "Sat 10:00 AM", title: "Doors Open & Community" },
      { time: "Sat 11:00 AM", title: "Session 1: The Promise" },
      { time: "Sat 3:00 PM", title: "Session 2: The Comforter" },
      { time: "Sat 6:30 PM", title: "Worship Night & Deliverance Prayer" },
    ],
    speakers: [
      { name: "Speaker TBA", role: "Keynote Speaker" },
      { name: "Shalom Worship", role: "Worship Team" },
      { name: "Ministry Team", role: "Prayer & Response" },
    ],
  },
  {
    year: "2025",
    theme: "Transcend",
    tagline: "A call to rise above limits and encounter God beyond the ordinary.",
    date: "October 11, 2025",
    shortDate: "Oct 11, 2025",
    location: "Shalom Conference",
    summary:
      "A gathering focused on transcending limits through worship, faith, and renewed hunger for God.",
    description:
      "Transcend marked a year of calling the next generation beyond ordinary expectations and into deeper devotion, bold prayer, and faith that moves beyond the room.",
    image: "/images/2025/shalom-2025-cover.png",
    highlights: [
      "High-energy worship",
      "Messages on identity and calling",
      "Group prayer moments",
      "Youth community connections",
    ],
    schedule: [
      { time: "10:00 AM", title: "Opening Worship" },
      { time: "12:00 PM", title: "Community Lunch" },
      { time: "2:00 PM", title: "Breakout Conversations" },
      { time: "6:00 PM", title: "Evening Gathering" },
    ],
    speakers: [
      { name: "Archive Speaker", role: "Main Session" },
      { name: "Shalom Worship", role: "Worship Team" },
    ],
  },
  {
    year: "2024",
    theme: "The Redeemed",
    tagline: "A gathering around the story of redemption in Christ.",
    date: "December 14, 2024",
    shortDate: "Dec 14, 2024",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "A worship gathering centered on Psalm 107:2-7 and the testimony of the redeemed.",
    description:
      "The Redeemed marked a Shalom gathering focused on the saving, restoring, and gathering work of God through worship and the Word.",
    image: "/images/2024/shalom-2024-cover.png",
    highlights: [
      "Electric worship",
      "Real encounter",
      "Deep community",
      "Weekend schedule",
    ],
    schedule: [
      { time: "Friday 7:30 PM", title: "Session 1: The Awakening" },
      { time: "Saturday 10:00 AM", title: "Session 2: Deep Waters" },
      { time: "Saturday 7:00 PM", title: "Session 3: The Outpouring" },
      { time: "Sunday 10:30 AM", title: "Session 4: Sent Out" },
    ],
    speakers: [
      { name: "Sarah Jenkins", role: "Keynote Speaker" },
      { name: "Shalom Worship", role: "House Band" },
      { name: "Marcus Doe", role: "Guest Speaker" },
      { name: "DJ Elevate", role: "Afterparty" },
    ],
  },
  {
    year: "2023",
    theme: "Fearless",
    tagline: "A call to stand in faith without fear.",
    date: "December 8-9, 2023",
    shortDate: "Dec 8-9, 2023",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "A Shalom gathering centered on Isaiah 41:10-11 and the courage God gives His people.",
    description:
      "Fearless called the Shalom family to trust God's presence, strength, and help in every season.",
    scripture: "Isaiah 41:10-11",
    image: "/images/2023/shalom-2023-cover.png",
    highlights: [
      "Fearless faith",
      "Worship and the Word",
      "Prayer and encouragement",
      "Two-day gathering",
    ],
    schedule: [
      { time: "December 8", title: "Opening Gathering" },
      { time: "December 9", title: "Main Conference Gathering" },
    ],
    speakers: [
      { name: "Pastor Wale Odunsanya", role: "Word Minister" },
      { name: "Pastor Natacha Byrams", role: "Minister" },
      { name: "Jumbo Ane", role: "Minister" },
      { name: "Folabi Nuel", role: "Minister" },
      { name: "Gideon Anim", role: "Minister" },
      { name: "Ejay Harold", role: "Minister" },
    ],
  },
  {
    year: "2022",
    theme: "The Lord Our Fortress",
    tagline: "A gathering declaring God as refuge, strength, and defense.",
    date: "December 16-17, 2022",
    shortDate: "Dec 16-17, 2022",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "A Shalom conference focused on the safety, strength, and covering found in the Lord.",
    description:
      "The Lord Our Fortress gathered the Shalom family around worship, prayer, and the declaration that God is a sure refuge for His people.",
    image: "/images/2022/shalom-2022-cover.png",
    highlights: [
      "God as refuge",
      "Worship and prayer",
      "Two-day conference",
      "Faith and strength",
    ],
    schedule: [
      { time: "December 16", title: "Opening Gathering" },
      { time: "December 17", title: "Main Conference Gathering" },
    ],
    speakers: [
      { name: "Higher Ground Assembly", role: "Host Ministry" },
      { name: "Reveille", role: "Conference Team" },
    ],
  },
  {
    year: "2021",
    theme: "Transcending Peace",
    tagline: "A gathering centered on peace that rises above circumstance.",
    date: "December 11, 2021",
    shortDate: "Dec 11, 2021",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "A Shalom conference focused on the peace of God that transcends fear, pressure, and uncertainty.",
    description:
      "Transcending Peace gathered the Shalom family around worship and the promise of God's peace in every season.",
    image: "/images/2021/shalom-2021-cover.png",
    highlights: [
      "Peace in Christ",
      "Worship and encouragement",
      "Streaming on YouTube",
      "Youth ministry gathering",
    ],
    schedule: [
      { time: "6:00 PM", title: "Shalom Conference 2021" },
    ],
    speakers: [
      { name: "Reveille Youth Ministry", role: "Host Ministry" },
      { name: "RCCG Higher Ground Assembly", role: "Streaming Host" },
    ],
  },
  {
    year: "2019",
    theme: "Perfect Peace",
    tagline: "A youth and young adults gathering centered on God's perfect peace.",
    date: "December 7, 2019",
    shortDate: "Dec 7, 2019",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "A Shalom annual conference focused on Isaiah 26:3 and the peace God gives to those whose minds are stayed on Him.",
    description:
      "Perfect Peace gathered youth and young adults for worship, ministry, and encouragement in the promise of God's peace.",
    scripture: "Isaiah 26:3",
    image: "/images/2019/shalom-2019-cover.png",
    highlights: [
      "Perfect peace",
      "Youth and young adults",
      "Worship and ministry",
      "Annual conference",
    ],
    schedule: [
      { time: "6:00 PM", title: "Doors Open" },
      { time: "6:30 PM", title: "Shalom Annual Conference" },
    ],
    speakers: [
      { name: "Pastor Bruce Goodwin", role: "Minister" },
      { name: "Osby Berry", role: "Minister" },
      { name: "Ejay Harold", role: "Minister" },
      { name: "HGA Youth Voices", role: "Worship Ministry" },
    ],
  },
];

export const currentConference = conferences[0];

export const archivedConferences = conferences.filter(
  (conference) => conference.year !== currentConference.year,
);

export function getConferenceByYear(year: string): Conference | undefined {
  return conferences.find((conference) => conference.year === year);
}
