import oreOlajuyigbeImage from "@assets/IMG_1085_1787621731433.JPG";
import bPraizImage from "@assets/IMG_5100_1787621750084.JPG";
import gbemiJImage from "@assets/IMG_1081_1787621760140.JPG";
import ejHaroldImage from "@assets/IMG_1084_1787621774400.JPG";
import robertBannermanImage from "@assets/Robert_Bannerman_Headshot_1787621782938.jpg";
import tobiSamagbeyiImage from "@assets/IMG_1082_1787621799133.JPG";
import reveileMusicImageOne from "@assets/IMG_9826_1787837392601.jpeg";
import shalom2026FlyerImage from "@assets/image_1787961443681.jpeg";
import prophetShamarBennettImage from "@assets/image_1788129880525.png";

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
  flyer?: string;
  highlights: string[];
  schedule: Array<{
    time: string;
    label?: string;
    title: string;
  }>;
  speakers: Array<{
    name: string;
    role: string;
    image?: string;
    imageLayout?: "portrait" | "landscape";
    bio?: string;
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
    image: shalom2026FlyerImage,
    flyer: shalom2026FlyerImage,
    highlights: [
      "Pure worship",
      "Teaching on the Comforter",
      "Deliverance and prayer ministry",
      "Spiritual renewal for students and young adults",
    ],
    schedule: [
      {
        time: "Friday | 7:00 PM",
        label: "Session One",
        title: "The Comforter: An Evening of Worship and Prophetic Encounter",
      },
      {
        time: "Saturday | 6:00 PM",
        label: "Session Two",
        title: "The Comforter: The Heart of Worship",
      },
    ],
    speakers: [
      {
        name: "Ore Olajuyigbe",
        role: "Minister",
        image: oreOlajuyigbeImage,
        bio: `Ore Olajuyigbe is a gifted worship leader and vocalist with a heart for creating an atmosphere where people can encounter God through sincere and heartfelt worship.

Her musical journey began at a young age, developing her gift through vocal performance and ensemble music before growing into her calling as a worship minister. Today, Ore uses her voice as an instrument of ministry, carrying a passion for God’s presence and a desire to point people toward Jesus.

Whether leading worship or serving alongside other ministers, Ore’s heart is to see people move beyond simply singing songs into experiencing genuine moments of worship, surrender, and intimacy with God.`,
      },
      {
        name: "B-Praiz",
        role: "Minister",
        image: bPraizImage,
        bio: `Boluwatife Olukoya, known as B-Praiz, is a gospel minister and songwriter with a divine mandate to release a sound that brings liberty to God’s people. Based in Baltimore, Maryland, USA, he was born and raised in Lagos, Nigeria, where his passion for music and ministry began.

B-Praiz is renowned for blending contemporary gospel with Afrobeats, crafting powerful, spirit-filled songs that inspire worship, restore hope, and uplift souls. His anointed ministrations and heartfelt melodies shift atmospheres, touching lives and transforming destinies.

Beyond music, he is deeply committed to spreading the gospel and using his sound as a tool for deliverance and breakthrough. Happily married and blessed with a beautiful daughter, B-Praiz continues to serve God passionately, bringing a message of freedom and victory through every song he releases.`,
      },
      {
        name: "Gbemi J",
        role: "Minister",
        image: gbemiJImage,
        bio: `Gbemi J is a passionate gospel artist, worship leader, and music minister with a heart for leading people into genuine encounters with God through worship and praise.

Her ministry is marked by heartfelt worship, joyful praise, and a sincere desire to see lives transformed in the presence of God. Over the years, she has lent her voice to various gospel projects and collaborations, including Seun Laoye’s The Name of the Lord, a live gospel album recorded in College Park, Maryland.

More recently, Gbemi J was featured by B-Praiz on Dance of Praise, showcasing her vibrant and expressive approach to praise music.

Whether through live ministration or recorded music, Gbemi’s heart remains centered on glorifying Jesus, serving His people, and using her gift to inspire others into deeper worship and joyful praise.`,
      },
      {
        name: "Robert Bannerman",
        role: "Minister",
        image: robertBannermanImage,
        bio: `Robert Bannerman is a passionate worship leader and music minister with a heart for leading people into genuine encounters with God through worship.

His ministry is rooted in a love for Jesus and a desire to see people drawn into deeper intimacy with God. Through heartfelt, Spirit-led worship, Robert seeks to create moments that move beyond music—moments where hearts are surrendered, faith is strengthened, and Jesus is exalted.

With humility and a commitment to serving the body of Christ, Robert continues to use his gift to point people toward the presence of God and make Jesus known through worship.`,
      },
      {
        name: "Ejay Harold",
        role: "Minister",
        image: ejHaroldImage,
        bio: `Ejay Harold is a Christian recording artist, worship leader, and music minister whose ministry is centered on creating authentic encounters with God through worship.

Since the release of In Worship in 2020, Ejay has continued to build a growing body of music, including I AM GOD, EL SHADDAI, IN WORSHIP (Live), WHAT A MIGHTY GOD, No Weapon, and Joy To The World. His music reflects a heart for reverence, passionate worship, and pointing people back to the greatness and faithfulness of God.

Beyond his recorded music, Ejay ministers across various worship gatherings and Christian events, using his gift to lead people into moments of heartfelt praise and worship. At the core of his ministry is a desire to exalt Jesus and see lives transformed in the presence of God.`,
      },
      {
        name: "Tobi Samagbeyi",
        role: "Minister",
        image: tobiSamagbeyiImage,
        bio: `Minister Tobi Samagbeyi is a passionate worship minister based in the DMV area, devoted to serving God through music and ministry. A member of CCI DMV, her life reflects a deep commitment to Christ, evident both in her lifestyle and her sound.

With releases such as Abba, Forever, and Son of Suffering, Tobi's music carries a heartfelt expression of worship, drawing listeners into deeper intimacy with God. Her style blends grace, authenticity, and spiritual depth, creating an atmosphere in which lives are transformed by the presence of the Holy Spirit.

She has ministered alongside notable gospel artists, including CalledOut Music, and continues to impact audiences through her dynamic and spirit-led worship. Her mission is to raise a generation of true worshippers and to see hearts aligned with the will of God through music.`,
      },
      {
        name: "Reveille Music",
        role: "Minister",
        image: reveileMusicImageOne,
        imageLayout: "landscape",
        bio: `Reveille Music is one of the worship expressions of RCCG Higher Ground Assembly, a collective of worship leaders, vocalists, and musicians united by a passion for God’s presence and a desire to see lives transformed through worship.

The name “Reveille,” meaning to awaken, reflects the heart of the ministry: to awaken hearts to Jesus and stir a generation toward deeper intimacy with God. Through passionate praise, heartfelt worship, and Spirit-led ministry, Reveille Music seeks to create an atmosphere where people can genuinely encounter God.

With a sound that blends contemporary worship with vibrant African praise, Reveille Music is committed to spiritual growth, excellence, unity, and service. Whether ministering within the local church or beyond its walls, their mission is to exalt Jesus and awaken a generation to a life of worship.`,
      },
      {
        name: "Prophet Shamar Bennett",
        role: "Minister",
        image: prophetShamarBennettImage,
      },
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
