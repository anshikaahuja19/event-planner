document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    //  STATE MANAGEMENT
    // =========================================
    let state = {
        events: JSON.parse(localStorage.getItem('ep_events')) || [],
        selectedEventId: null,
        currentView: 'dashboard',
        isDarkMode: false,
        notifications: JSON.parse(localStorage.getItem('ep_notifs')) || [],
        vendorFilter: 'All'
    };

    const persist = () => {
        localStorage.setItem('ep_events', JSON.stringify(state.events));
        localStorage.setItem('ep_notifs', JSON.stringify(state.notifications));
    };

    // =========================================
    //  VENDOR DATABASE (with city, state, region for proximity matching)
    // =========================================
    const VENDOR_DATABASE = [
        // -- Delhi NCR Region --
        { id: 1,  name: "Grand Plaza Hotel",      category: "Venue",       rating: 4.8, price: "₹₹₹", city: "New Delhi",    state: "Delhi",         region: "North" },
        { id: 2,  name: "Garden Estates",          category: "Venue",       rating: 4.5, price: "₹₹",  city: "South Delhi",  state: "Delhi",         region: "North" },
        { id: 6,  name: "Royal Decorators",        category: "Decor",       rating: 4.7, price: "₹₹₹", city: "Gurugram",     state: "Haryana",       region: "North" },
        { id: 7,  name: "Bloom & Petal",           category: "Decor",       rating: 4.6, price: "₹₹",  city: "Delhi",        state: "Delhi",         region: "North" },
        { id: 8,  name: "SnapClick Studios",       category: "Photography", rating: 4.6, price: "₹₹",  city: "Noida",        state: "Uttar Pradesh", region: "North" },
        { id: 10, name: "Capital Caterers",        category: "Catering",    rating: 4.5, price: "₹₹",  city: "New Delhi",    state: "Delhi",         region: "North" },
        { id: 11, name: "NCR Sound & Lights",      category: "Decor",       rating: 4.3, price: "₹",   city: "Faridabad",    state: "Haryana",       region: "North" },
        // -- Rajasthan --
        { id: 3,  name: "Lakeside Convention",     category: "Venue",       rating: 4.3, price: "₹₹",  city: "Udaipur",      state: "Rajasthan",     region: "North" },
        { id: 5,  name: "Spice Kitchen",           category: "Catering",    rating: 4.4, price: "₹",   city: "Jaipur",       state: "Rajasthan",     region: "North" },
        { id: 12, name: "Desert Pearl Decor",      category: "Decor",       rating: 4.5, price: "₹₹",  city: "Jaipur",       state: "Rajasthan",     region: "North" },
        { id: 13, name: "Rajwada Photography",     category: "Photography", rating: 4.7, price: "₹₹₹", city: "Jodhpur",      state: "Rajasthan",     region: "North" },
        // -- Maharashtra --
        { id: 4,  name: "Taste of India",          category: "Catering",    rating: 4.9, price: "₹₹",  city: "Mumbai",       state: "Maharashtra",   region: "West" },
        { id: 14, name: "Sea View Convention",     category: "Venue",       rating: 4.6, price: "₹₹₹", city: "Mumbai",       state: "Maharashtra",   region: "West" },
        { id: 15, name: "Pune Event Decorators",   category: "Decor",       rating: 4.4, price: "₹₹",  city: "Pune",         state: "Maharashtra",   region: "West" },
        { id: 16, name: "Western Lens Studios",    category: "Photography", rating: 4.5, price: "₹₹",  city: "Pune",         state: "Maharashtra",   region: "West" },
        // -- Karnataka --
        { id: 9,  name: "Lens Masters",            category: "Photography", rating: 4.8, price: "₹₹₹", city: "Bangalore",    state: "Karnataka",     region: "South" },
        { id: 17, name: "Palace Grounds Venue",    category: "Venue",       rating: 4.7, price: "₹₹₹", city: "Bangalore",    state: "Karnataka",     region: "South" },
        { id: 18, name: "South Spice Caterers",    category: "Catering",    rating: 4.6, price: "₹₹",  city: "Bangalore",    state: "Karnataka",     region: "South" },
        // -- Tamil Nadu --
        { id: 19, name: "Chennai Grand Hall",      category: "Venue",       rating: 4.4, price: "₹₹",  city: "Chennai",      state: "Tamil Nadu",    region: "South" },
        { id: 20, name: "Chettinad Caterers",      category: "Catering",    rating: 4.7, price: "₹₹",  city: "Chennai",      state: "Tamil Nadu",    region: "South" },
        // -- Telangana --
        { id: 21, name: "Hyderabad Nawab Caterers", category: "Catering",   rating: 4.8, price: "₹₹₹", city: "Hyderabad",    state: "Telangana",     region: "South" },
        { id: 22, name: "Golconda Decor",          category: "Decor",       rating: 4.5, price: "₹₹",  city: "Hyderabad",    state: "Telangana",     region: "South" },
        // -- West Bengal --
        { id: 23, name: "Kolkata Heritage Venue",  category: "Venue",       rating: 4.5, price: "₹₹",  city: "Kolkata",      state: "West Bengal",   region: "East" },
        { id: 24, name: "Bengal Feast Caterers",   category: "Catering",    rating: 4.6, price: "₹₹",  city: "Kolkata",      state: "West Bengal",   region: "East" },
        // -- Gujarat --
        { id: 25, name: "Ahmedabad Grand Venue",   category: "Venue",       rating: 4.4, price: "₹₹",  city: "Ahmedabad",    state: "Gujarat",       region: "West" },
        { id: 26, name: "Gujarat Rasa Caterers",   category: "Catering",    rating: 4.5, price: "₹",   city: "Ahmedabad",    state: "Gujarat",       region: "West" }
    ];

    // City → State lookup for proximity matching
    const CITY_STATE_MAP = {
        'new delhi': 'Delhi', 'delhi': 'Delhi', 'south delhi': 'Delhi', 'north delhi': 'Delhi',
        'noida': 'Uttar Pradesh', 'ghaziabad': 'Uttar Pradesh', 'lucknow': 'Uttar Pradesh', 'agra': 'Uttar Pradesh',
        'gurugram': 'Haryana', 'gurgaon': 'Haryana', 'faridabad': 'Haryana', 'chandigarh': 'Haryana',
        'jaipur': 'Rajasthan', 'udaipur': 'Rajasthan', 'jodhpur': 'Rajasthan',
        'mumbai': 'Maharashtra', 'pune': 'Maharashtra', 'nagpur': 'Maharashtra',
        'bangalore': 'Karnataka', 'bengaluru': 'Karnataka', 'mysore': 'Karnataka',
        'chennai': 'Tamil Nadu', 'coimbatore': 'Tamil Nadu', 'madurai': 'Tamil Nadu',
        'hyderabad': 'Telangana', 'secunderabad': 'Telangana',
        'kolkata': 'West Bengal', 'howrah': 'West Bengal',
        'ahmedabad': 'Gujarat', 'surat': 'Gujarat', 'vadodara': 'Gujarat'
    };

    const STATE_REGION_MAP = {
        'Delhi': 'North', 'Haryana': 'North', 'Uttar Pradesh': 'North', 'Rajasthan': 'North', 'Punjab': 'North',
        'Maharashtra': 'West', 'Gujarat': 'West', 'Goa': 'West',
        'Karnataka': 'South', 'Tamil Nadu': 'South', 'Telangana': 'South', 'Kerala': 'South', 'Andhra Pradesh': 'South',
        'West Bengal': 'East', 'Bihar': 'East', 'Odisha': 'East', 'Jharkhand': 'East',
        'Madhya Pradesh': 'Central', 'Chhattisgarh': 'Central'
    };

    /** Returns { city, state, region } from a user-entered location string */
    const resolveLocation = (locationStr) => {
        const lower = locationStr.trim().toLowerCase();
        // Direct city match
        if (CITY_STATE_MAP[lower]) {
            const st = CITY_STATE_MAP[lower];
            return { city: locationStr.trim(), state: st, region: STATE_REGION_MAP[st] || 'Other' };
        }
        // Try matching against known cities as substrings
        for (const [city, st] of Object.entries(CITY_STATE_MAP)) {
            if (lower.includes(city)) {
                return { city, state: st, region: STATE_REGION_MAP[st] || 'Other' };
            }
        }
        // Try matching state names directly
        for (const [st, reg] of Object.entries(STATE_REGION_MAP)) {
            if (lower.includes(st.toLowerCase())) {
                return { city: locationStr.trim(), state: st, region: reg };
            }
        }
        return { city: locationStr.trim(), state: null, region: null };
    };

    /** Score vendor proximity: 3 = same city, 2 = same state, 1 = same region, 0 = other */
    const getProximityScore = (vendor, eventLoc) => {
        const vendorCity = vendor.city.toLowerCase();
        const eventCity = eventLoc.city.toLowerCase();
        if (vendorCity === eventCity || vendorCity.includes(eventCity) || eventCity.includes(vendorCity)) return 3;
        if (eventLoc.state && vendor.state === eventLoc.state) return 2;
        if (eventLoc.region && vendor.region === eventLoc.region) return 1;
        return 0;
    };

    const getProximityLabel = (score) => {
        if (score === 3) return '<span class="proximity-badge nearby"><i class="fas fa-map-pin"></i> Same City</span>';
        if (score === 2) return '<span class="proximity-badge same-state"><i class="fas fa-map"></i> Same State</span>';
        if (score === 1) return '<span class="proximity-badge same-region"><i class="fas fa-globe-asia"></i> Same Region</span>';
        return '';
    };

    const BUDGET_TEMPLATES = {
        wedding:    { venue: 0.35, catering: 0.25, decor: 0.15, photography: 0.10, logistics: 0.05, admin: 0.10 },
        corporate:  { venue: 0.40, catering: 0.30, speakers: 0.15, marketing: 0.05, admin: 0.10 },
        birthday:   { venue: 0.20, catering: 0.40, entertainment: 0.20, decor: 0.15, admin: 0.05 },
        conference: { venue: 0.40, catering: 0.20, speakers: 0.15, marketing: 0.10, admin: 0.15 },
        other:      { venue: 0.30, catering: 0.30, decor: 0.15, logistics: 0.10, admin: 0.15 }
    };

    // Timeline tasks defined by percentage of time between creation and event date
    const TIMELINE_TASKS = [
        { title: "Finalize Event Concept & Theme",        pct: 0.00, category: "Planning" },
        { title: "Research & Shortlist Vendors",          pct: 0.08, category: "Planning" },
        { title: "Secure Venue Booking",                  pct: 0.15, category: "Logistics" },
        { title: "Confirm Catering & Menu",               pct: 0.25, category: "Operations" },
        { title: "Book Photographer / Videographer",      pct: 0.35, category: "Operations" },
        { title: "Send Invitations to Guests",            pct: 0.45, category: "Communication" },
        { title: "Finalize Decor & Floral Arrangements", pct: 0.55, category: "Operations" },
        { title: "Confirm All Vendor Contracts",          pct: 0.65, category: "Operations" },
        { title: "Send Reminder to Guests",               pct: 0.80, category: "Communication" },
        { title: "Final Walkthrough & Rehearsal",         pct: 0.92, category: "Logistics" },
        { title: "🌻 Event Day — Execute & Enjoy!",       pct: 1.00, category: "Execution" }
    ];

    // =========================================
    //  DOM SELECTORS
    // =========================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const createEventModal = $('#create-event-modal');
    const eventForm = $('#event-form');
    const aiToast = $('#ai-toast');
    const notifPanel = $('#notif-panel');

    // =========================================
    //  HELPERS
    // =========================================
    const getEventIcon = (type) => {
        const icons = { wedding: 'fa-heart', corporate: 'fa-briefcase', birthday: 'fa-cake-candles', conference: 'fa-microphone', other: 'fa-calendar-day' };
        return icons[type] || 'fa-calendar';
    };

    const getCategoryIcon = (cat) => {
        const icons = { venue: 'fa-building', catering: 'fa-utensils', decor: 'fa-wand-magic-sparkles', photography: 'fa-camera', logistics: 'fa-truck', admin: 'fa-user-tie', speakers: 'fa-microphone', marketing: 'fa-bullhorn', entertainment: 'fa-music' };
        return icons[cat] || 'fa-tag';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const addNotif = (text) => {
        state.notifications.unshift({ text, time: new Date().toISOString() });
        if (state.notifications.length > 20) state.notifications.pop();
        persist();
        renderNotifications();
    };

    const showToast = (msg, duration = 2000) => {
        aiToast.querySelector('.ai-text').innerText = msg;
        aiToast.classList.remove('hidden');
        if (duration > 0) {
            setTimeout(() => aiToast.classList.add('hidden'), duration);
        }
    };

    // =========================================
    //  NAVIGATION (ALL SIDEBAR + BUTTONS)
    // =========================================
    const showView = (viewId) => {
        $$('.view').forEach(v => v.classList.remove('active'));
        const el = document.getElementById(viewId + '-view');
        if (el) el.classList.add('active');
        state.currentView = viewId;

        // highlight nav
        $$('.nav-item').forEach(i => {
            i.classList.toggle('active', i.dataset.view === viewId);
        });
    };

    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            showView(view);

            // render view-specific content
            if (view === 'dashboard') updateDashboard();
            if (view === 'my-events') renderAllEvents();
            if (view === 'vendors') renderGlobalVendors();
            if (view === 'analytics') renderAnalytics();
        });
    });

    // =========================================
    //  DASHBOARD
    // =========================================
    const updateDashboard = () => {
        $('#greeting-text').innerText = `${getGreeting()}, Planner`;

        const count = state.events.length;
        $('#count-events').innerText = count;

        let totalAtt = 0;
        let totalTasks = 0;
        let completedTasks = 0;
        state.events.forEach(e => {
            totalAtt += (e.attendees ? e.attendees.length : 0);
            if (e.timeline) {
                totalTasks += e.timeline.length;
                completedTasks += e.timeline.filter(t => t.completed).length;
            }
        });
        $('#count-attendees').innerText = totalAtt;
        $('#count-tasks').innerText = `${completedTasks}/${totalTasks}`;

        // Budget utilization
        let totalBudget = 0, totalSpent = 0;
        state.events.forEach(e => {
            totalBudget += parseInt(e.budget) || 0;
            if (e.expenses) {
                Object.values(e.expenses).forEach(v => totalSpent += v);
            }
        });
        const utilPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        $('#budget-utilization').innerText = utilPct + '%';

        if (count > 0) {
            $('#greeting-sub').innerText = `You have ${count} event${count > 1 ? 's' : ''} and ${totalTasks - completedTasks} tasks pending.`;
        } else {
            $('#greeting-sub').innerText = "Let's start planning something amazing today.";
        }

        renderEventGrid($('#recent-events-grid'), state.events.slice(0, 6));
    };

    const renderEventGrid = (container, events) => {
        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-seedling"></i></div>
                    <h3>No events yet</h3>
                    <p>Plant the seed — create your first event!</p>
                    <button class="btn btn-primary empty-create-trigger"><i class="fas fa-plus"></i> Create Event</button>
                </div>`;
            container.querySelectorAll('.empty-create-trigger').forEach(b => b.addEventListener('click', openCreateModal));
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="event-card" data-id="${event.id}">
                <div class="event-image">
                    <i class="fas ${getEventIcon(event.type)}"></i>
                </div>
                <div class="event-body">
                    <span class="event-tag">${event.type}</span>
                    <h3>${event.title}</h3>
                    <p class="text-sm text-muted"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                </div>
                <div class="event-footer">
                    <span><i class="fas fa-calendar"></i> ${formatDate(event.date)}</span>
                    <span class="text-primary">View Details →</span>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', () => showEventDetails(card.dataset.id));
        });
    };

    // View All link
    $('#view-all-link').addEventListener('click', (e) => {
        e.preventDefault();
        showView('my-events');
        renderAllEvents();
    });

    // =========================================
    //  MY EVENTS VIEW
    // =========================================
    const renderAllEvents = () => {
        renderEventGrid($('#all-events-grid'), state.events);
    };

    // =========================================
    //  SEARCH
    // =========================================
    $('#search-input').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
            if (state.currentView === 'dashboard') updateDashboard();
            if (state.currentView === 'my-events') renderAllEvents();
            return;
        }
        const filtered = state.events.filter(ev =>
            ev.title.toLowerCase().includes(q) ||
            ev.type.toLowerCase().includes(q) ||
            ev.location.toLowerCase().includes(q)
        );
        const container = state.currentView === 'my-events' ? $('#all-events-grid') : $('#recent-events-grid');
        renderEventGrid(container, filtered);
    });

    // =========================================
    //  EVENT CREATION
    // =========================================
    const openCreateModal = () => {
        createEventModal.classList.add('active');
        eventForm.reset();
        showFormStep(1);
    };

    $('#create-event-btn').addEventListener('click', openCreateModal);
    if ($('#empty-create-btn')) $('#empty-create-btn').addEventListener('click', openCreateModal);
    if ($('#events-create-btn')) $('#events-create-btn').addEventListener('click', openCreateModal);

    $$('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => createEventModal.classList.remove('active'));
    });

    // Close modal on backdrop click
    createEventModal.addEventListener('click', (e) => {
        if (e.target === createEventModal) createEventModal.classList.remove('active');
    });

    let currentStep = 1;
    const showFormStep = (step) => {
        currentStep = step;
        $$('.form-step').forEach(s => s.classList.remove('active'));
        $(`.form-step[data-step="${step}"]`).classList.add('active');
    };

    $('.next-step').addEventListener('click', () => {
        // validate step 1
        const title = $('#event-title').value.trim();
        const date = $('#event-date').value;
        const size = $('#event-size').value;
        const loc = $('#event-location').value.trim();
        if (!title || !date || !size || !loc) {
            alert('Please fill in all fields.');
            return;
        }
        showFormStep(2);
    });
    $('.prev-step').addEventListener('click', () => showFormStep(1));

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title    = $('#event-title').value.trim();
        const type     = $('#event-type').value;
        const date     = $('#event-date').value;
        const size     = parseInt($('#event-size').value);
        const location = $('#event-location').value.trim();
        const budget   = parseInt($('#event-budget').value);
        const useAI    = $('#ai-auto-generate').checked;

        if (!budget || budget <= 0) { alert('Please enter a valid budget.'); return; }

        createEventModal.classList.remove('active');
        showToast('AI is generating your event plan...', 0);

        setTimeout(() => {
            const aiResult = useAI
                ? generateAISuggestions(type, budget, date, location)
                : { budgetSplit: {}, timeline: [], suggestedVendors: [], eventLoc: resolveLocation(location) };

            const newEvent = {
                id: 'evt-' + Date.now(),
                title, type, date, size, location, budget,
                budgetSplit: aiResult.budgetSplit,
                timeline: aiResult.timeline,
                expenses: {},
                attendees: [],
                selectedVendors: [],
                suggestedVendors: aiResult.suggestedVendors,
                eventLoc: aiResult.eventLoc,
                createdAt: new Date().toISOString()
            };

            state.events.unshift(newEvent);
            persist();

            addNotif(`Event "${title}" created successfully!`);
            aiToast.classList.add('hidden');
            showEventDetails(newEvent.id);
        }, 1800);
    });

    // =========================================
    //  AI SUGGESTION ENGINE (CSP)
    // =========================================
    const generateAISuggestions = (type, budget, date, location) => {
        // --- Budget Split ---
        const template = BUDGET_TEMPLATES[type] || BUDGET_TEMPLATES.other;
        const budgetSplit = {};
        Object.keys(template).forEach(cat => {
            budgetSplit[cat] = Math.round(budget * template[cat]);
        });

        // --- Timeline: starts from TODAY, ends at event date ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);
        const totalDays = Math.max(Math.round((eventDate - today) / (1000 * 60 * 60 * 24)), 1);

        const timeline = TIMELINE_TASKS.map((task, index) => {
            const daysFromNow = Math.round(totalDays * task.pct);
            const taskDate = new Date(today);
            taskDate.setDate(taskDate.getDate() + daysFromNow);
            return {
                id: `task-${index}-${Date.now()}`,
                title: task.title,
                date: taskDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                rawDate: taskDate.toISOString(),
                category: task.category,
                completed: false
            };
        });

        // --- Vendor Suggestions: sorted by proximity ---
        const eventLoc = resolveLocation(location);
        const suggestedVendors = [...VENDOR_DATABASE]
            .map(v => ({ ...v, proximity: getProximityScore(v, eventLoc) }))
            .sort((a, b) => b.proximity - a.proximity)
            .slice(0, 10)
            .map(v => v.id);

        return { budgetSplit, timeline, suggestedVendors, eventLoc };
    };

    // =========================================
    //  EVENT DETAIL VIEW
    // =========================================
    const showEventDetails = (eventId) => {
        const event = state.events.find(e => e.id === eventId);
        if (!event) return;

        state.selectedEventId = eventId;

        $('#detail-title').innerText = event.title;
        $('#detail-date').innerHTML = `<i class="fas fa-calendar"></i> ${formatDate(event.date)}`;
        $('#detail-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
        $('#detail-size').innerHTML = `<i class="fas fa-users"></i> ${event.size} Guests`;
        $('#detail-budget-label').innerHTML = `<i class="fas fa-wallet"></i> ₹${parseInt(event.budget).toLocaleString()}`;
        $('#budget-total-val').innerText = `₹${parseInt(event.budget).toLocaleString()}`;

        renderTimeline(event);
        renderBudget(event);
        renderAttendees(event);
        renderDetailVendors(event);

        // Reset tabs
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-content').forEach(c => c.classList.add('hidden'));
        $('.tab-btn[data-tab="timeline"]').classList.add('active');
        $('#timeline-tab').classList.remove('hidden');

        showView('event-detail');
    };

    // Back button
    $('#detail-back-btn').addEventListener('click', () => {
        showView('dashboard');
        updateDashboard();
    });

    // Delete event
    $('#delete-event-btn').addEventListener('click', () => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        state.events = state.events.filter(e => e.id !== state.selectedEventId);
        persist();
        addNotif('Event deleted.');
        showView('dashboard');
        updateDashboard();
    });

    // =========================================
    //  TIMELINE
    // =========================================
    const renderTimeline = (event) => {
        const container = $('#timeline-list');
        if (!event.timeline || event.timeline.length === 0) {
            container.innerHTML = '<p class="text-muted" style="padding:1rem;">No timeline generated. Edit this event to add tasks.</p>';
            return;
        }
        container.innerHTML = event.timeline.map(item => `
            <div class="timeline-item ${item.completed ? 'completed' : ''}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="item-main">
                        <h4>${item.title}</h4>
                        <p>${item.date} • ${item.category}</p>
                    </div>
                    <div class="item-action">
                        <input type="checkbox" ${item.completed ? 'checked' : ''} data-task-id="${item.id}">
                    </div>
                </div>
            </div>
        `).join('');

        // Attach checkbox listeners
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const taskId = cb.dataset.taskId;
                const task = event.timeline.find(t => t.id === taskId);
                if (task) {
                    task.completed = cb.checked;
                    persist();
                    renderTimeline(event);
                }
            });
        });
    };

    // Optimize timeline button
    $('#optimize-timeline-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.timeline) return;
        showToast('Optimizing timeline...', 1500);
        setTimeout(() => {
            // Move incomplete tasks forward slightly
            event.timeline.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
            persist();
            renderTimeline(event);
        }, 1500);
    });

    // =========================================
    //  BUDGET
    // =========================================
    const renderBudget = (event) => {
        const budgetList = $('#budget-allocation-list');
        const entries = Object.entries(event.budgetSplit || {});
        if (entries.length === 0) {
            budgetList.innerHTML = '<p class="text-muted" style="padding:1rem;">No budget split generated.</p>';
            return;
        }

        const expenses = event.expenses || {};

        budgetList.innerHTML = entries.map(([category, allocated]) => {
            const spent = expenses[category] || 0;
            const pct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
            return `
            <div class="budget-card">
                <div class="budget-card-header">
                    <div class="category-icon"><i class="fas ${getCategoryIcon(category)}"></i></div>
                    <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span class="amount">₹${allocated.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
                <div class="budget-meta">
                    <span>Spent: ₹${spent.toLocaleString()}</span>
                    <span>${pct}% used</span>
                </div>
            </div>`;
        }).join('');

        // Populate expense category dropdown
        const sel = $('#expense-category');
        sel.innerHTML = entries.map(([cat]) => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
    };

    // Add expense
    $('#add-expense-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event) return;
        const cat = $('#expense-category').value;
        const amt = parseInt($('#expense-amount').value);
        if (!cat || !amt || amt <= 0) { alert('Enter a valid category and amount.'); return; }

        if (!event.expenses) event.expenses = {};
        event.expenses[cat] = (event.expenses[cat] || 0) + amt;
        persist();
        renderBudget(event);
        $('#expense-amount').value = '';
        showToast(`₹${amt.toLocaleString()} expense added to ${cat}.`);
    });

    // =========================================
    //  ATTENDEES
    // =========================================
    const renderAttendees = (event) => {
        const tbody = $('#attendee-list');
        const rsvpDashboard = $('#rsvp-dashboard');
        
        if (!event.attendees || event.attendees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;">No attendees added yet.</td></tr>`;
            if (rsvpDashboard) rsvpDashboard.style.display = 'none';
            return;
        }

        const total = event.attendees.length;
        const confirmed = event.attendees.filter(a => a.status === 'Confirmed').length;
        const declined  = event.attendees.filter(a => a.status === 'Declined').length;
        const invited   = event.attendees.filter(a => a.status === 'Invited').length;
        const pending   = event.attendees.filter(a => a.status === 'Pending').length;
        const awaiting  = invited + pending;

        if (rsvpDashboard) {
            rsvpDashboard.style.display = 'block';
            $('#rsvp-summary').innerHTML = `
                <div class="rsvp-pill rsvp-confirmed">✅ Confirmed: ${confirmed}</div>
                <div class="rsvp-pill rsvp-declined">✗ Declined: ${declined}</div>
                <div class="rsvp-pill rsvp-awaiting">⏳ Awaiting: ${awaiting}</div>
            `;
            
            const pctConf = total > 0 ? (confirmed / total) * 100 : 0;
            const pctDecl = total > 0 ? (declined / total) * 100 : 0;
            const respondedPct = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;
            
            $('#rsvp-progress-confirmed').style.width = `${pctConf}%`;
            $('#rsvp-progress-declined').style.width = `${pctDecl}%`;
            $('#rsvp-progress-label').innerText = `${respondedPct}% responded`;
        }
        tbody.innerHTML = event.attendees.map((a, idx) => `
            <tr>
                <td>${a.name}</td>
                <td>${a.email}</td>
                <td><span class="status-tag ${a.status.toLowerCase()}">${a.status}</span></td>
                <td>${a.group || 'General'}</td>
                <td style="display:flex;gap:6px;align-items:center;">
                    ${a.status !== 'Confirmed' ? `<button class="btn btn-sm btn-success confirm-btn" data-idx="${idx}">✓ Confirm</button>` : ''}
                    ${a.status !== 'Declined'  ? `<button class="btn btn-sm btn-danger decline-btn" data-idx="${idx}">✗ Decline</button>` : ''}
                    <button class="delete-attendee-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        // Action listeners
        tbody.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                event.attendees[parseInt(btn.dataset.idx)].status = 'Confirmed';
                persist(); renderAttendees(event);
            });
        });

        tbody.querySelectorAll('.decline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                event.attendees[parseInt(btn.dataset.idx)].status = 'Declined';
                persist(); renderAttendees(event);
            });
        });

        // Delete attendee buttons
        tbody.querySelectorAll('.delete-attendee-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                event.attendees.splice(idx, 1);
                persist();
                renderAttendees(event);
            });
        });
    };

    // Add attendee
    $('#add-attendee-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event) return;
        const name = prompt('Attendee name:');
        if (!name) return;
        const email = prompt('Attendee email:');
        if (!email) return;
        const group = prompt('Group (e.g. VVIP, Family, Regular):', 'General') || 'General';

        event.attendees.push({ name, email, status: 'Pending', group });
        persist();
        renderAttendees(event);
        addNotif(`${name} added to "${event.title}".`);
    });

    // Send invitations
    $('#send-invites-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.attendees.length) { alert('No attendees to invite.'); return; }

        showToast('Sending invitations...');
        setTimeout(() => {
            event.attendees.forEach(a => { if (a.status === 'Pending') a.status = 'Invited'; });
            persist();
            renderAttendees(event);
            addNotif(`Invitations sent to ${event.attendees.length} guests for "${event.title}".`);
        }, 1500);
    });

    // Send reminders
    $('#send-reminders-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.attendees.length) { alert('No attendees to remind.'); return; }

        const total = event.attendees.length;
        const responded = event.attendees.filter(a => a.status === 'Confirmed' || a.status === 'Declined').length;
        
        if (responded === total) {
            showToast('All guests have responded — no reminders needed!', 2500);
            return;
        }

        const invited = event.attendees.filter(a => a.status === 'Invited').length;

        showToast('Sending reminders...');
        setTimeout(() => {
            showToast(`Reminders sent to ${invited} guests who haven't responded yet`, 3000);
            addNotif(`Reminders sent to ${invited} invited guests for "${event.title}".`);
        }, 1500);
    });

    // =========================================
    //  VENDORS (Detail View — sorted by proximity)
    // =========================================
    const renderDetailVendors = (event, filter = 'All') => {
        const vendorList = $('#vendor-list');
        const eventLoc = event.eventLoc || resolveLocation(event.location);

        let vendors = VENDOR_DATABASE.map(v => ({
            ...v,
            proximity: getProximityScore(v, eventLoc)
        }));

        // Apply category filter
        if (filter !== 'All') {
            vendors = vendors.filter(v => v.category === filter);
        }

        // Sort: highest proximity first, then by rating
        vendors.sort((a, b) => b.proximity - a.proximity || b.rating - a.rating);

        vendorList.innerHTML = vendors.map(v => {
            const isSelected = (event.selectedVendors || []).includes(v.id);
            const isSuggested = (event.suggestedVendors || []).includes(v.id);
            const proxLabel = getProximityLabel(v.proximity);
            return `
            <div class="vendor-card ${isSelected ? 'selected-vendor' : ''} ${isSuggested ? 'suggested-vendor' : ''}" data-vendor-id="${v.id}">
                <div class="vendor-card-top">
                    <div>
                        <h4>${v.name} ${isSuggested ? '<i class="fas fa-star" style="color:var(--honey);font-size:0.75rem;"></i>' : ''}</h4>
                        <p class="text-sm text-muted">${v.category} • ${v.city}, ${v.state}</p>
                        ${proxLabel}
                    </div>
                    <div class="vendor-rating">${'★'.repeat(Math.floor(v.rating))} <span class="text-sm text-muted">${v.rating}</span></div>
                </div>
                <div class="vendor-card-bottom">
                    <span class="vendor-price">${v.price}</span>
                    <button class="btn btn-sm ${isSelected ? 'btn-success' : 'btn-outline'} vendor-select-btn" data-vid="${v.id}">
                        ${isSelected ? '<i class="fas fa-check"></i> Selected' : 'Select Vendor'}
                    </button>
                </div>
            </div>`;
        }).join('');

        // Vendor selection toggle
        vendorList.querySelectorAll('.vendor-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const vid = parseInt(btn.dataset.vid);
                if (!event.selectedVendors) event.selectedVendors = [];
                const idx = event.selectedVendors.indexOf(vid);
                if (idx > -1) {
                    event.selectedVendors.splice(idx, 1);
                } else {
                    event.selectedVendors.push(vid);
                }
                persist();
                renderDetailVendors(event, filter);
            });
        });
    };

    // Detail vendor filter tags
    $('#detail-vendor-filters').addEventListener('click', (e) => {
        const tag = e.target.closest('.tag');
        if (!tag) return;
        $$('#detail-vendor-filters .tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        const event = state.events.find(ev => ev.id === state.selectedEventId);
        if (event) renderDetailVendors(event, tag.dataset.filter);
    });

    // =========================================
    //  VENDORS (Global View)
    // =========================================
    const renderGlobalVendors = (filter = 'All') => {
        const vendorList = $('#global-vendor-list');
        const filteredVendors = filter === 'All' ? VENDOR_DATABASE : VENDOR_DATABASE.filter(v => v.category === filter);

        vendorList.innerHTML = filteredVendors.map(v => `
            <div class="vendor-card">
                <div class="vendor-card-top">
                    <div>
                        <h4>${v.name}</h4>
                        <p class="text-sm text-muted">${v.category} • ${v.city}, ${v.state}</p>
                    </div>
                    <div class="vendor-rating">${'★'.repeat(Math.floor(v.rating))} <span class="text-sm text-muted">${v.rating}</span></div>
                </div>
                <div class="vendor-card-bottom">
                    <span class="vendor-price">${v.price}</span>
                    <span class="text-sm text-muted">${v.city}</span>
                </div>
            </div>
        `).join('');
    };

    $('#global-vendor-filters').addEventListener('click', (e) => {
        const tag = e.target.closest('.tag');
        if (!tag) return;
        $$('#global-vendor-filters .tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        renderGlobalVendors(tag.dataset.filter);
    });

    // =========================================
    //  ANALYTICS VIEW
    // =========================================
    const renderAnalytics = () => {
        const container = $('#analytics-content');
        if (state.events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-chart-line"></i></div>
                    <h3>No data yet</h3>
                    <p>Create events and track expenses to see analytics.</p>
                </div>`;
            return;
        }

        // Aggregate budget by category across all events
        const catTotals = {};
        const catSpent = {};
        state.events.forEach(ev => {
            Object.entries(ev.budgetSplit || {}).forEach(([cat, amt]) => {
                catTotals[cat] = (catTotals[cat] || 0) + amt;
            });
            Object.entries(ev.expenses || {}).forEach(([cat, amt]) => {
                catSpent[cat] = (catSpent[cat] || 0) + amt;
            });
        });

        const maxVal = Math.max(...Object.values(catTotals), 1);

        // Event summary
        const totalBudget = state.events.reduce((s, e) => s + (parseInt(e.budget) || 0), 0);
        const totalSpent = Object.values(catSpent).reduce((s, v) => s + v, 0);
        const totalAttendees = state.events.reduce((s, e) => s + (e.attendees ? e.attendees.length : 0), 0);

        container.innerHTML = `
            <div class="stats-grid" style="margin-bottom:2rem;">
                <div class="stat-card">
                    <div class="stat-icon amber"><i class="fas fa-calendar-check"></i></div>
                    <div class="stat-info"><span class="label">Total Events</span><span class="value">${state.events.length}</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon honey"><i class="fas fa-indian-rupee-sign"></i></div>
                    <div class="stat-info"><span class="label">Total Budget</span><span class="value">₹${totalBudget.toLocaleString()}</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-receipt"></i></div>
                    <div class="stat-info"><span class="label">Total Spent</span><span class="value">₹${totalSpent.toLocaleString()}</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warm"><i class="fas fa-users"></i></div>
                    <div class="stat-info"><span class="label">Total Guests</span><span class="value">${totalAttendees}</span></div>
                </div>
            </div>
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>Budget Allocation by Category</h4>
                    <div class="bar-chart">
                        ${Object.entries(catTotals).map(([cat, val]) => `
                            <div class="bar-row">
                                <span class="bar-label">${cat}</span>
                                <div class="bar-track"><div class="bar-value" style="width:${(val/maxVal)*100}%"></div></div>
                                <span class="bar-amount">₹${val.toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="analytics-card">
                    <h4>Spending vs Allocation</h4>
                    <div class="bar-chart">
                        ${Object.entries(catTotals).map(([cat, allocated]) => {
                            const spent = catSpent[cat] || 0;
                            const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                            return `
                            <div class="bar-row">
                                <span class="bar-label">${cat}</span>
                                <div class="bar-track"><div class="bar-value" style="width:${pct}%"></div></div>
                                <span class="bar-amount">${pct}%</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>`;
    };

    // =========================================
    //  NOTIFICATIONS
    // =========================================
    const renderNotifications = () => {
        const badge = $('#notif-badge');
        badge.innerText = state.notifications.length;
        badge.style.display = state.notifications.length > 0 ? 'flex' : 'none';

        const list = $('#notif-list');
        if (state.notifications.length === 0) {
            list.innerHTML = '<p class="text-muted" style="padding:1rem;text-align:center;">No notifications yet.</p>';
            return;
        }
        list.innerHTML = state.notifications.map(n => `
            <div class="notif-item">
                <i class="fas fa-sun"></i>
                <div>
                    <div>${n.text}</div>
                    <div class="text-sm text-muted">${formatDate(n.time)}</div>
                </div>
            </div>
        `).join('');
    };

    $('#notif-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        notifPanel.classList.toggle('hidden');
    });

    $('#clear-notifs').addEventListener('click', () => {
        state.notifications = [];
        persist();
        renderNotifications();
    });

    // Close notif panel on outside click
    document.addEventListener('click', (e) => {
        if (!notifPanel.contains(e.target) && !$('#notif-btn').contains(e.target)) {
            notifPanel.classList.add('hidden');
        }
    });

    // =========================================
    //  TAB SWITCHING
    // =========================================
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.add('hidden'));

            btn.classList.add('active');
            const tabName = btn.dataset.tab;
            // Map tab names to element IDs
            const tabMap = {
                'timeline': 'timeline-tab',
                'budget': 'budget-tab',
                'attendees': 'attendees-tab',
                'vendors': 'event-vendors-tab'
            };
            const tabEl = document.getElementById(tabMap[tabName]);
            if (tabEl) tabEl.classList.remove('hidden');
        });
    });

    // =========================================
    //  THEME TOGGLE
    // =========================================
    $('#theme-toggle').addEventListener('click', () => {
        state.isDarkMode = !state.isDarkMode;
        document.body.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
        $('#theme-toggle').innerHTML = state.isDarkMode
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });

    // =========================================
    //  INITIALIZE
    // =========================================
    updateDashboard();
    renderNotifications();
});
