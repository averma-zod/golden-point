/**
 * Default Golden Point Circles
 * Founding circle represents Akash Verma, Moniv Nautiyal, and Sahil Malik
 * based on their card and charter terms from Sahil Heights Society.
 */
export const DEFAULT_CIRCLES = [
  {
    id: "pune-goa-founding",
    name: "The Golden Point",
    subtitle: "Unlimited Redemption Card",
    society: "Sahil Heights Society",
    location: "Pune, India",
    established: "2026",
    currency: "₹",
    currencyCode: "INR",
    fdAmount: 25000,
    cardNumber: "8888 7777 6666 5555",
    cvv: "777",
    validThru: "LIFETIME",
    theme: "gold-carbon",
    committee: [
      {
        id: "moniv",
        name: "Moniv Nautiyal",
        role: "Committee Founder",
        avatar: "MN",
        fdStatus: "LOCKED",
        signature: "Moniv Nautiyal"
      },
      {
        id: "sahil",
        name: "Sahil Malik",
        role: "Committee Founder",
        avatar: "SM",
        fdStatus: "LOCKED",
        signature: "Sahil Malik"
      },
      {
        id: "akash",
        name: "Akash Verma",
        role: "Committee Founder & Current Redeemer",
        avatar: "AV",
        fdStatus: "LOCKED",
        signature: "Akash Verma"
      }
    ],
    currentHolderId: "akash",
    activeInvocation: {
      id: "inv-goa-001",
      redeemerId: "akash",
      redeemerName: "Akash Verma",
      title: "Escape from Sahil Heights: Pune to Goa Road Trip",
      description: "Immediate convoy travel from Pune to Goa this coming Friday. 3-day beach villa expedition. Full squad presence mandatory. No work or domestic excuses permitted.",
      category: "Epic Travel",
      timestamp: "2026-10-24T10:00:00Z",
      deadline: "2026-10-27T18:00:00Z",
      targetMemberIds: ["moniv", "sahil"],
      responses: {
        "moniv": { status: "AWAITING", note: "", timestamp: null },
        "sahil": { status: "AWAITING", note: "", timestamp: null }
      },
      unlockedFdTotal: 0
    },
    contenders: [
      {
        id: "rohan-sharma",
        name: "Rohan Sharma",
        avatar: "RS",
        plansCount: 2,
        targetPlans: 3,
        plans: [
          { id: "p1", title: "Lonavala Monsoon Ridge Trek", date: "2026-08-15" },
          { id: "p2", title: "Diwali Weekend Poker at Sahil Heights", date: "2026-10-12" }
        ],
        status: "IN_PROGRESS",
        votes: {}
      }
    ],
    ledger: [
      {
        id: "leg-0",
        type: "CREATION",
        badge: "Charter Signed",
        text: "The Golden Point Charter established by Moniv Nautiyal, Sahil Malik, and Akash Verma at Sahil Heights Society.",
        timestamp: "2026-09-01T12:00:00Z"
      },
      {
        id: "leg-1",
        type: "VAULT",
        badge: "FD Committed",
        text: "Standing Fixed Deposit of ₹25,000 committed by each founder into the Golden Vault (Total Vault: ₹75,000).",
        timestamp: "2026-09-01T12:05:00Z"
      },
      {
        id: "leg-2",
        type: "CARD",
        badge: "Card Minted",
        text: "Physical Golden Point Card #8888 7777 6666 5555 minted. Custody awarded to Akash Verma.",
        timestamp: "2026-09-05T14:30:00Z"
      },
      {
        id: "leg-3",
        type: "INVOCATION",
        badge: "Point Invoked",
        text: "Akash Verma invoked the Golden Point: 'Escape from Sahil Heights: Pune to Goa Road Trip'. Responses pending.",
        timestamp: "2026-10-24T10:00:00Z"
      }
    ]
  }
];
