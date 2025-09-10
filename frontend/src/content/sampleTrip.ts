export const sampleTrip = {
      trip_id: 'demo-trip-' + Date.now(),
      user_id: 'demo-user',
      title: 'Relax & Rejuvenate in Mumbai: A Luxury Wellness Escape',
      destination: 'Mumbai',
      start_location: 'Bhubaneswar',
      start_date: '2025-09-11',
      duration_days: 2,
      budget: 135000,
      is_international: false,
      is_saved: false,
      itinerary_data: {
        title: 'Relax & Rejuvenate in Mumbai: A Luxury Wellness Escape',
        destination: 'Mumbai',
        duration_days: 2,
        start_date: '2025-09-11',
        estimated_total_cost: '₹135000',
        best_time_to_visit: 'October to March offers pleasant, cooler weather with lower humidity, ideal for exploring.',
        travel_tips: [
          'Mumbai traffic can be challenging; allocate extra time for travel.',
          'Stay hydrated, especially in September as humidity can be high.',
          'Pre-book all spa treatments and fine dining reservations.'
        ],
        daily_plans: [
          {
            day: 1,
            date: '2025-09-11',
            theme: 'Arrival & Ultimate Wellness Indulgence',
            activities: [
              {
                time: '08:00 AM - 10:30 AM',
                activity: 'Travel from Bhubaneshwar to Mumbai',
                location: 'Bhubaneshwar Airport to Mumbai Airport',
                description: 'Board a comfortable flight from Bhubaneshwar to Mumbai.',
                estimated_cost: '₹10000',
                duration: '2.5 hours',
                image_search_query: 'Bhubaneshwar Mumbai flight',
                booking_info: {
                  required: true,
                  url: 'https://www.makemytrip.com/flights/',
                  price_range: '₹8000-12000'
                }
              }
            ]
          }
        ],
        accommodation: [
          {
            name: 'The Taj Mahal Palace, Mumbai',
            type: 'Luxury Hotel',
            price_range: '₹28000-₹35000/night',
            rating: '4.8/5',
            location: 'Apollo Bunder, Colaba, Mumbai',
            booking_url: 'https://www.tajhotels.com/',
            amenities: ['Jiva Spa', 'Outdoor Pool', 'Fine Dining']
          }
        ],
        transportation: [
          {
            type: 'Flights',
            from: 'Bhubaneshwar (BBI)',
            to: 'Mumbai (BOM)',
            estimated_cost: '₹20000',
            duration: '2.5 hours each way',
            booking_url: 'https://www.makemytrip.com/flights/'
          }
        ],
        neighboring_places: [
          {
            name: 'Alibaug',
            distance: 'Approx. 95 km',
            description: 'A serene coastal town known for its clean beaches.',
            time_to_reach: 'Approx. 2-3 hours',
            best_known_for: 'Beaches, Kolaba Fort',
            estimated_cost: '₹4000-₹6000',
            image_search_query: 'Alibaug beach'
          }
        ]
      },
      tags: ['Luxury', 'Wellness', 'Relaxation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };