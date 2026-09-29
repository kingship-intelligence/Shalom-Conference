const shalom2026FlyerImage = "/images/2026/shalom-2026-flyer.webp";

const oreOlajuyigbeImage = "/images/2026/speakers/ore-olajuyigbe.webp";
const bPraizImage = "/images/2026/speakers/b-praiz.webp";
const gbemiJImage = "/images/2026/speakers/gbemi-j.webp";
const ejHaroldImage = "/images/2026/speakers/ejay-harold.webp";
const robertBannermanImage = "/images/2026/speakers/robert-bannerman.webp";
const tobiSamagbeyiImage = "/images/2026/speakers/tobi-samagbeyi.webp";
const reveileMusicImageOne = "/images/2026/speakers/reveille-music.webp";
const prophetShamarBennettImage = "/images/2026/speakers/prophet-shamar-bennett.webp";
const tomideOlulanaImage = "/images/2026/speakers/tomide-olulana.webp";
const femiOpeyemiImage = "/images/2026/speakers/femi-opeyemi.webp";

export type Conference = {
  year: string;
  theme: string;
  tagline: string;
  date: string;
  /** Omit when the venue for an archived year is not on record. */
  location?: string;
  summary: string;
  description: string;
  scripture?: string;
  scriptureText?: string;
  image: string;
  flyer?: string;
  /** Omit for archived years where the programme is not on record. */
  schedule?: Array<{
    time: string;
    label?: string;
    title: string;
  }>;
  /** Omit for archived years where the lineup is not on record. */
  speakers?: Array<{
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
    tagline: "Two nights of worship, prayer and the Word, built around the Holy Spirit.",
    date: "October 9-10, 2026",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary:
      "Two nights in Windsor Mill for students and young adults who want more of the Holy Spirit.",
    description:
      "This year we are gathering around John 14:26-27 and the One Jesus called the Comforter. Friday night is worship and prophetic ministry. Saturday is the heart of worship. Come ready to pray, to be prayed for, and to leave lighter than you came.",
    scripture: "John 14:26-27",
    scriptureText:
      "But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance. Peace I leave with you, my peace I give unto you.",
    image: shalom2026FlyerImage,
    flyer: shalom2026FlyerImage,
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
        name: "Prophet Shamar Bennett",
        role: "Prophet",
        image: prophetShamarBennettImage,
        bio: `Prophet Shamar Bennett is the visionary and founder of Shamar Bennett Ministries and “The Prophetic Flow.” This mighty prophetic voice has traveled the globe extensively preaching the gospel in the United States, the Caribbean, Europe, and Africa, with signs and wonders following. He has been afforded the opportunity and grace of God to minister in many different arenas, including radio, television, conferences, and revivals.

As a prophet, he has been called upon by business leaders, political leaders, and spiritual leaders to provide prophetic insight and direction that has literally shifted the lives and destinies of both individuals and nations.

In addition to his work in the church arena, Prophet Shamar Bennett holds a Master’s Degree in Business Administration and a Bachelor’s Degree in Business Management. He has studied abroad in England and the Dominican Republic and has sat on the boards of companies as both a spiritual advisor and subject matter expert.`,
      },
      {
        name: "Tomide Olulana",
        role: "Minister",
        image: tomideOlulanaImage,
        bio: `Tomide Olulana is a dedicated Christian youth leader, community coordinator, and speaker who has devoted his life to empowering the next generation of faith-driven leaders. Raised in a vibrant Christian household as the son of Pastors Ayoola and Oluremi Olulana, Tomide’s deep-rooted values and passion for ministry were shaped by a strong spiritual upbringing.

Today, Tomide serves as the Youth President for “Reveille,” a prominent youth leadership division focused on spiritual growth, character development, and community impact. Known for his visionary approach to youth ministry, he has been instrumental in creating spaces where young adults can deepen their relationship with God and discover their purpose.

Among his notable leadership achievements is his work spearheading the Shalom Conference—a major faith-driven youth empowerment event designed to foster resilience, spiritual renewal, and community bond among young people. Through Reveille and initiatives like the Shalom Conference, Tomide continues to build a lasting legacy of faith, service, and leadership. He resides in the United States with his wife, Dr. Mofoluwake “Foluke” Olulana.`,
      },
      {
        name: "Ore Olajuyigbe",
        role: "Music Minister",
        image: oreOlajuyigbeImage,
        bio: `Ore Olajuyigbe is a gifted worship leader and vocalist with a heart for creating an atmosphere where people can encounter God through sincere and heartfelt worship.

Her musical journey began at a young age, developing her gift through vocal performance and ensemble music before growing into her calling as a worship minister. Today, Ore uses her voice as an instrument of ministry, carrying a passion for God’s presence and a desire to point people toward Jesus.

Whether leading worship or serving alongside other ministers, Ore’s heart is to see people move beyond simply singing songs into experiencing genuine moments of worship, surrender, and intimacy with God.`,
      },
      {
        name: "B-Praiz",
        role: "Music Minister",
        image: bPraizImage,
        bio: `Boluwatife Olukoya, known as B-Praiz, is a gospel minister and songwriter with a divine mandate to release a sound that brings liberty to God’s people. Based in Baltimore, Maryland, USA, he was born and raised in Lagos, Nigeria, where his passion for music and ministry began.

B-Praiz is renowned for blending contemporary gospel with Afrobeats, crafting powerful, spirit-filled songs that inspire worship, restore hope, and uplift souls. His anointed ministrations and heartfelt melodies shift atmospheres, touching lives and transforming destinies.

Beyond music, he is deeply committed to spreading the gospel and using his sound as a tool for deliverance and breakthrough. Happily married and blessed with a beautiful daughter, B-Praiz continues to serve God passionately, bringing a message of freedom and victory through every song he releases.`,
      },
      {
        name: "Gbemi J",
        role: "Music Minister",
        image: gbemiJImage,
        bio: `Gbemi J is a passionate gospel artist, worship leader, and music minister with a heart for leading people into genuine encounters with God through worship and praise.

Her ministry is marked by heartfelt worship, joyful praise, and a sincere desire to see lives transformed in the presence of God. Over the years, she has lent her voice to various gospel projects and collaborations, including Seun Laoye’s The Name of the Lord, a live gospel album recorded in College Park, Maryland.

More recently, Gbemi J was featured by B-Praiz on Dance of Praise, showcasing her vibrant and expressive approach to praise music.

Whether through live ministration or recorded music, Gbemi’s heart remains centered on glorifying Jesus, serving His people, and using her gift to inspire others into deeper worship and joyful praise.`,
      },
      {
        name: "Robert Bannerman",
        role: "Music Minister",
        image: robertBannermanImage,
        bio: `Robert Bannerman is a passionate worship leader and music minister with a heart for leading people into genuine encounters with God through worship.

His ministry is rooted in a love for Jesus and a desire to see people drawn into deeper intimacy with God. Through heartfelt, Spirit-led worship, Robert seeks to create moments that move beyond music—moments where hearts are surrendered, faith is strengthened, and Jesus is exalted.

With humility and a commitment to serving the body of Christ, Robert continues to use his gift to point people toward the presence of God and make Jesus known through worship.`,
      },
      {
        name: "Ejay Harold",
        role: "Music Minister",
        image: ejHaroldImage,
        bio: `Ejay Harold is a Christian recording artist, worship leader, and music minister whose ministry is centered on creating authentic encounters with God through worship.

Since the release of In Worship in 2020, Ejay has continued to build a growing body of music, including I AM GOD, EL SHADDAI, IN WORSHIP (Live), WHAT A MIGHTY GOD, No Weapon, and Joy To The World. His music reflects a heart for reverence, passionate worship, and pointing people back to the greatness and faithfulness of God.

Beyond his recorded music, Ejay ministers across various worship gatherings and Christian events, using his gift to lead people into moments of heartfelt praise and worship. At the core of his ministry is a desire to exalt Jesus and see lives transformed in the presence of God.`,
      },
      {
        name: "Tobi Samagbeyi",
        role: "Music Minister",
        image: tobiSamagbeyiImage,
        bio: `Minister Tobi Samagbeyi is a passionate worship minister based in the DMV area, devoted to serving God through music and ministry. A member of CCI DMV, her life reflects a deep commitment to Christ, evident both in her lifestyle and her sound.

With releases such as Abba, Forever, and Son of Suffering, Tobi's music carries a heartfelt expression of worship, drawing listeners into deeper intimacy with God. Her style blends grace, authenticity, and spiritual depth, creating an atmosphere in which lives are transformed by the presence of the Holy Spirit.

She has ministered alongside notable gospel artists, including CalledOut Music, and continues to impact audiences through her dynamic and spirit-led worship. Her mission is to raise a generation of true worshippers and to see hearts aligned with the will of God through music.`,
      },
      {
        name: "Femi Opeyemi",
        role: "Music Minister",
        image: femiOpeyemiImage,
        bio: `Femi Opeyemi is a gifted, spirit-filled gospel singer, songwriter, and worship leader whose passion for music began at the age of 12. Raised in a Christian family, he has grown into a dedicated minister whose music and worship ministry bring hope, encouragement, and spiritual inspiration to many. In 2019, Femi released his soul-stirring single, “Iwo Loba,” a heartfelt expression of his love for God and his commitment to sharing the message of faith through music. Known for his powerful ministrations and sincere worship, he continues to impact lives across the nation.

Beyond music ministry, Femi is a compassionate medical scientist. His devotion to God, family, and service remains a source of inspiration to everyone around him.`,
      },
      {
        name: "Reveille Music",
        role: "Music Minister",
        image: reveileMusicImageOne,
        imageLayout: "landscape",
        bio: `Reveille Music is one of the worship expressions of RCCG Higher Ground Assembly, a collective of worship leaders, vocalists, and musicians united by a passion for God’s presence and a desire to see lives transformed through worship.

The name “Reveille,” meaning to awaken, reflects the heart of the ministry: to awaken hearts to Jesus and stir a generation toward deeper intimacy with God. Through passionate praise, heartfelt worship, and Spirit-led ministry, Reveille Music seeks to create an atmosphere where people can genuinely encounter God.

With a sound that blends contemporary worship with vibrant African praise, Reveille Music is committed to spiritual growth, excellence, unity, and service. Whether ministering within the local church or beyond its walls, their mission is to exalt Jesus and awaken a generation to a life of worship.`,
      },
    ],
  },
  {
    year: "2025",
    theme: "Transcend",
    tagline: "Rising above what we thought were our limits.",
    date: "October 11, 2025",
    summary: "Shalom 2025 was a call to go past the ceiling we had put on our faith.",
    description:
      "Transcend pushed us to expect more of God than we had been. One day, one room, and a lot of prayer.",
    image: "/images/2025/shalom-2025-cover.png",
  },
  {
    year: "2024",
    theme: "The Redeemed",
    tagline: "Let the redeemed of the Lord say so.",
    date: "December 14, 2024",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary: "Built on Psalm 107:2-7. A night about what God has already done.",
    description:
      "The Redeemed was a night of worship and testimony. We spent it remembering how far God has brought us and saying so out loud.",
    scripture: "Psalm 107:2-7",
    image: "/images/2024/shalom-2024-cover.png",
  },
  {
    year: "2023",
    theme: "Fearless",
    tagline: "Fear not, for I am with you.",
    date: "December 8-9, 2023",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary: "Two days on Isaiah 41:10-11 and the courage God gives His people.",
    description:
      "Fearless was about trusting that God is actually with us, especially when the situation says otherwise.",
    scripture: "Isaiah 41:10-11",
    image: "/images/2023/shalom-2023-cover.png",
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
    tagline: "God as our refuge, our strength, and our defense.",
    date: "December 16-17, 2022",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary: "Two days declaring that God is a safe place to run to.",
    description:
      "The Lord Our Fortress was worship and prayer around one idea: whatever is going on, God is a sure refuge for His people.",
    image: "/images/2022/shalom-2022-cover.png",
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
    tagline: "Peace that does not depend on the circumstances.",
    date: "December 11, 2021",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary: "One evening on the peace of God that outlasts fear, pressure and uncertainty.",
    description:
      "Transcending Peace was a single evening of worship, streamed on YouTube for everyone who could not be in the room.",
    image: "/images/2021/shalom-2021-cover.png",
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
    tagline: "Thou wilt keep him in perfect peace, whose mind is stayed on thee.",
    date: "December 7, 2019",
    location: "2021 Lord Baltimore Dr, Windsor Mill, MD 21244",
    summary: "A youth and young adults night on Isaiah 26:3.",
    description:
      "Perfect Peace was worship, ministry and a room full of young people learning to keep their minds on God.",
    scripture: "Isaiah 26:3",
    image: "/images/2019/shalom-2019-cover.png",
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
