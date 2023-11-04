const groupData = [
    {
        organizerId: 1,
        name: "Tennis on the Water Group",
        about: "Enjoy rounds of tennis with a tight-knit group of people on the water. Singles or doubles.",
        type: "In person",
        private: true,
        city: "New York",
        state: "NY"
    },
    {
        organizerId: 2,
        name: "Yoga by the Beach Group",
        about: "Relax and unwind with yoga sessions by the beach. Perfect for all levels of yogis.",
        type: "In person",
        private: false,
        city: "Los Angeles",
        state: "CA"
    },
    {
        organizerId: 3,
        name: "Cinephiles Group",
        about: "Join us for movie screenings and popcorn. Family-friendly event.",
        type: "In person",
        private: false,
        city: "Austin",
        state: "TX"
    }
];

const venueData = [
    {
      address: "123 Disney Lane",
      groupId: 1,
      city: "New York",
      state: "NY",
      lat: 37.7645358,
      lng: -122.4730327
    },
    {
      address: "456 Oceanfront Avenue",
      groupId: 2,
      city: "Los Angeles",
      state: "CA",
      lat: 34.052235,
      lng: -118.243683
    },
    {
      address: "789 Parkside Drive",
      groupId: 3,
      city: "Chicago",
      state: "IL",
      lat: 41.878113,
      lng: -87.629799
    }
  ];


const eventData = [
    {
      id: 1,
      groupId: 1,
      venueId: 1,
      name: "Tennis Group First Meet and Greet",
      type: "Online",
      capacity: 10,
      price: 18.50,
      description: "The first meet and greet for our group! Come say hello!",
      startDate: "2023-11-19 20:00:00",
      endDate: "2023-11-19 22:00:00"
    },
    {
      id: 2,
      groupId: 2,
      venueId: 2,
      name: "Beach Yoga and Meditation",
      type: "In person",
      capacity: 15,
      price: 20.00,
      description: "Join us for a rejuvenating yoga and meditation session by the beach.",
      startDate: "2024-05-15 07:30:00",
      endDate: "2024-05-15 09:30:00"
    },
    {
      id: 3,
      groupId: 3,
      venueId: 3,
      name: "Outdoor Movie Night Under the Stars",
      type: "In person",
      capacity: 50,
      price: 0.00,
      description: "Watch a classic movie under the open sky with your friends and family.",
      startDate: "2024-07-08 19:00:00",
      endDate: "2024-07-08 22:00:00"
    }
  ]
