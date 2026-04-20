document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof emailjs !== 'undefined') {
        emailjs.init(ENV.EMAILJS_PUBLIC_KEY);
    }


    let grokBudgetApiKey = (typeof ENV !== 'undefined' && ENV.GROK_API_KEY) ? ENV.GROK_API_KEY : '';
    let state = {
        events: JSON.parse(localStorage.getItem('ep_events')) || [],
        selectedEventId: null,
        currentView: 'dashboard',
        isDarkMode: false,
        notifications: JSON.parse(localStorage.getItem('ep_notifs')) || [],
        vendorFilter: 'All',
        emailSettings: {
            replyTo: localStorage.getItem('ep_reply_email') || '',
            copyMe: localStorage.getItem('ep_copy_me') === 'true'
        }
    };

    const persist = () => {
        localStorage.setItem('ep_events', JSON.stringify(state.events));
        localStorage.setItem('ep_notifs', JSON.stringify(state.notifications));
        localStorage.setItem('ep_reply_email', state.emailSettings.replyTo);
        localStorage.setItem('ep_copy_me', state.emailSettings.copyMe);
    };

    const VENDOR_DATABASE = [

        { id: 1,  name: "Grand Plaza Hotel",      category: "Venue",       rating: 4.8, price: "₹₹₹", city: "New Delhi",    state: "Delhi",         region: "North" },
        { id: 2,  name: "Garden Estates",          category: "Venue",       rating: 4.5, price: "₹₹",  city: "South Delhi",  state: "Delhi",         region: "North" },
        { id: 6,  name: "Royal Decorators",        category: "Decor",       rating: 4.7, price: "₹₹₹", city: "Gurugram",     state: "Haryana",       region: "North" },
        { id: 7,  name: "Bloom & Petal",           category: "Decor",       rating: 4.6, price: "₹₹",  city: "Delhi",        state: "Delhi",         region: "North" },
        { id: 8,  name: "SnapClick Studios",       category: "Photography", rating: 4.6, price: "₹₹",  city: "Noida",        state: "Uttar Pradesh", region: "North" },
        { id: 10, name: "Capital Caterers",        category: "Catering",    rating: 4.5, price: "₹₹",  city: "New Delhi",    state: "Delhi",         region: "North" },
        { id: 11, name: "NCR Sound & Lights",      category: "Decor",       rating: 4.3, price: "₹",   city: "Faridabad",    state: "Haryana",       region: "North" },

        { id: 3,  name: "Lakeside Convention",     category: "Venue",       rating: 4.3, price: "₹₹",  city: "Udaipur",      state: "Rajasthan",     region: "North" },
        { id: 5,  name: "Spice Kitchen",           category: "Catering",    rating: 4.4, price: "₹",   city: "Jaipur",       state: "Rajasthan",     region: "North" },
        { id: 12, name: "Desert Pearl Decor",      category: "Decor",       rating: 4.5, price: "₹₹",  city: "Jaipur",       state: "Rajasthan",     region: "North" },
        { id: 13, name: "Rajwada Photography",     category: "Photography", rating: 4.7, price: "₹₹₹", city: "Jodhpur",      state: "Rajasthan",     region: "North" },

        { id: 4,  name: "Taste of India",          category: "Catering",    rating: 4.9, price: "₹₹",  city: "Mumbai",       state: "Maharashtra",   region: "West" },
        { id: 14, name: "Sea View Convention",     category: "Venue",       rating: 4.6, price: "₹₹₹", city: "Mumbai",       state: "Maharashtra",   region: "West" },
        { id: 15, name: "Pune Event Decorators",   category: "Decor",       rating: 4.4, price: "₹₹",  city: "Pune",         state: "Maharashtra",   region: "West" },
        { id: 16, name: "Western Lens Studios",    category: "Photography", rating: 4.5, price: "₹₹",  city: "Pune",         state: "Maharashtra",   region: "West" },

        { id: 9,  name: "Lens Masters",            category: "Photography", rating: 4.8, price: "₹₹₹", city: "Bangalore",    state: "Karnataka",     region: "South" },
        { id: 17, name: "Palace Grounds Venue",    category: "Venue",       rating: 4.7, price: "₹₹₹", city: "Bangalore",    state: "Karnataka",     region: "South" },
        { id: 18, name: "South Spice Caterers",    category: "Catering",    rating: 4.6, price: "₹₹",  city: "Bangalore",    state: "Karnataka",     region: "South" },

        { id: 19, name: "Chennai Grand Hall",      category: "Venue",       rating: 4.4, price: "₹₹",  city: "Chennai",      state: "Tamil Nadu",    region: "South" },
        { id: 20, name: "Chettinad Caterers",      category: "Catering",    rating: 4.7, price: "₹₹",  city: "Chennai",      state: "Tamil Nadu",    region: "South" },

        { id: 21, name: "Hyderabad Nawab Caterers", category: "Catering",   rating: 4.8, price: "₹₹₹", city: "Hyderabad",    state: "Telangana",     region: "South" },
        { id: 22, name: "Golconda Decor",          category: "Decor",       rating: 4.5, price: "₹₹",  city: "Hyderabad",    state: "Telangana",     region: "South" },

        { id: 23, name: "Kolkata Heritage Venue",  category: "Venue",       rating: 4.5, price: "₹₹",  city: "Kolkata",      state: "West Bengal",   region: "East" },
        { id: 24, name: "Bengal Feast Caterers",   category: "Catering",    rating: 4.6, price: "₹₹",  city: "Kolkata",      state: "West Bengal",   region: "East" },

        { id: 25, name: "Ahmedabad Grand Venue",   category: "Venue",       rating: 4.4, price: "₹₹",  city: "Ahmedabad",    state: "Gujarat",       region: "West" },
        { id: 26, name: "Gujarat Rasa Caterers",   category: "Catering",    rating: 4.5, price: "₹",   city: "Ahmedabad",    state: "Gujarat",       region: "West" }
    ];

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

    const resolveLocation = (locationStr) => {
        const lower = locationStr.trim().toLowerCase();

        if (CITY_STATE_MAP[lower]) {
            const st = CITY_STATE_MAP[lower];
            return { city: locationStr.trim(), state: st, region: STATE_REGION_MAP[st] || 'Other' };
        }

        for (const [city, st] of Object.entries(CITY_STATE_MAP)) {
            if (lower.includes(city)) {
                return { city, state: st, region: STATE_REGION_MAP[st] || 'Other' };
            }
        }

        for (const [st, reg] of Object.entries(STATE_REGION_MAP)) {
            if (lower.includes(st.toLowerCase())) {
                return { city: locationStr.trim(), state: st, region: reg };
            }
        }
        return { city: locationStr.trim(), state: null, region: null };
    };

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

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const createEventModal = $('#create-event-modal');
    const eventForm = $('#event-form');
    const aiToast = $('#ai-toast');
    const notifPanel = $('#notif-panel');

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

    const showView = (viewId) => {
        $$('.view').forEach(v => v.classList.remove('active'));
        const el = document.getElementById(viewId + '-view');
        if (el) el.classList.add('active');
        state.currentView = viewId;

        $$('.nav-item').forEach(i => {
            i.classList.toggle('active', i.dataset.view === viewId);
        });
    };

    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            showView(view);

            if (view === 'dashboard') updateDashboard();
            if (view === 'my-events') renderAllEvents();
            if (view === 'vendors') renderGlobalVendors();
            if (view === 'analytics') renderAnalytics();
        });
    });

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

        const hasOverspend = state.events.some(ev =>
            Object.entries(ev.budgetSplit || {}).some(([cat, alloc]) =>
                (ev.expenses?.[cat] || 0) > alloc
            )
        );
        const overspendMsg = '⚠ Budget alert: one or more categories are overspent.';
        if (hasOverspend && !state.notifications.some(n => n.text === overspendMsg)) {
            addNotif(overspendMsg);
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

    $('#view-all-link').addEventListener('click', (e) => {
        e.preventDefault();
        showView('my-events');
        renderAllEvents();
    });

    const renderAllEvents = () => {
        renderEventGrid($('#all-events-grid'), state.events);
    };

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
                autoFollowUp: true,
                createdAt: new Date().toISOString()
            };

            state.events.unshift(newEvent);
            persist();

            addNotif(`Event "${title}" created successfully!`);
            aiToast.classList.add('hidden');
            showEventDetails(newEvent.id);
        }, 1800);
    });

    const generateAISuggestions = (type, budget, date, location) => {

        const template = BUDGET_TEMPLATES[type] || BUDGET_TEMPLATES.other;
        const budgetSplit = {};
        Object.keys(template).forEach(cat => {
            budgetSplit[cat] = Math.round(budget * template[cat]);
        });

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

        const eventLoc = resolveLocation(location);
        const suggestedVendors = [...VENDOR_DATABASE]
            .map(v => ({ ...v, proximity: getProximityScore(v, eventLoc) }))
            .sort((a, b) => b.proximity - a.proximity)
            .slice(0, 10)
            .map(v => v.id);

        return { budgetSplit, timeline, suggestedVendors, eventLoc };
    };

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
        renderFeedbackTab(event);

        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-content').forEach(c => c.classList.add('hidden'));
        $('.tab-btn[data-tab="timeline"]').classList.add('active');
        $('#timeline-tab').classList.remove('hidden');

        showView('event-detail');
    };

    $('#detail-back-btn').addEventListener('click', () => {
        showView('dashboard');
        updateDashboard();
    });

    $('#delete-event-btn').addEventListener('click', () => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        state.events = state.events.filter(e => e.id !== state.selectedEventId);
        persist();
        addNotif('Event deleted.');
        showView('dashboard');
        updateDashboard();
    });

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

    $('#optimize-timeline-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.timeline) return;
        showToast('Optimizing timeline...', 1500);
        setTimeout(() => {

            event.timeline.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
            persist();
            renderTimeline(event);
        }, 1500);
    });

    const renderBudget = (event) => {
        if (!event.expenseLog) {
            event.expenseLog = [];
            if (event.expenses) {
                Object.entries(event.expenses).forEach(([cat, amt]) => {
                    if (amt > 0) {
                        event.expenseLog.push({
                            id: 'exp-legacy-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                            category: cat,
                            amount: amt,
                            note: 'Legacy record',
                            date: event.createdAt || new Date().toISOString()
                        });
                    }
                });
            }
        }

        event.expenses = {};
        event.expenseLog.forEach(exp => {
            event.expenses[exp.category] = (event.expenses[exp.category] || 0) + parseInt(exp.amount);
        });

        const budgetList = $('#budget-allocation-list');
        const entries = Object.entries(event.budgetSplit || {});
        if (entries.length === 0) {
            budgetList.innerHTML = '<p class="text-muted" style="padding:1rem;">No budget split generated.</p>';
            return;
        }

        const expenses = event.expenses || {};

        const totalBudget = parseInt(event.budget) || 0;
        let totalSpent = 0;
        if (event.expenses) {
            Object.values(event.expenses).forEach(v => totalSpent += v);
        }
        const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        const meterContainer = $('#budget-meter-container');
        if (meterContainer) {
            const barColor = totalPct < 60 ? 'var(--success)' : totalPct < 80 ? 'var(--warning)' : totalPct < 100 ? 'var(--orange, orange)' : 'var(--danger)';
            const remainAmt = totalBudget - totalSpent;
            meterContainer.innerHTML = `
                <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="font-size: 1.5rem; font-weight: 700;">₹${totalSpent.toLocaleString()} <span style="font-size: 1rem; color: var(--muted); font-weight: 400;">/ ₹${totalBudget.toLocaleString()} (${totalPct}% used)</span></span>
                    <span style="font-weight: 500; color: ${remainAmt >= 0 ? 'var(--success)' : 'var(--danger)'};">Remaining: ₹${remainAmt.toLocaleString()}</span>
                </div>
                <div class="progress-bar" style="height: 12px; background: var(--border); border-radius: var(--radius-sm);">
                    <div class="progress-fill" style="width: ${Math.min(totalPct, 100)}%; background: ${barColor}; height: 100%; border-radius: var(--radius-sm); transition: width 0.3s ease;"></div>
                </div>
            `;
        }

        budgetList.innerHTML = entries.map(([category, allocated]) => {
            const spent = expenses[category] || 0;
            const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
            const isOver    = pct >= 100;
            const isWarning = pct >= 80 && pct < 100;
            const overAmt   = spent - allocated;

            let borderClass = '';
            if (isOver) borderClass = 'over';
            else if (isWarning) borderClass = 'warn';

            let velocityText = '';
            if (spent === 0) {
                velocityText = '<span style="color: var(--muted); margin-top: 0.4rem; display: block; font-size: 0.8rem;">Not started</span>';
            } else if (spent >= allocated) {
                velocityText = '<span style="color: var(--success); margin-top: 0.4rem; display: block; font-size: 0.8rem;">✓ Complete</span>';
            } else {
                const catLogs = event.expenseLog.filter(l => l.category === category).sort((a,b) => new Date(b.date) - new Date(a.date));
                if (catLogs.length >= 2) {
                    const l1 = parseInt(catLogs[0].amount);
                    const l2 = parseInt(catLogs[1].amount);
                    if (l1 > allocated * 0.2 && l2 > allocated * 0.2) {
                        velocityText = '<span style="color: var(--orange, orange); margin-top: 0.4rem; display: block; font-size: 0.8rem;">⚡ Spending fast</span>';
                    }
                }
            }

            return `
            <div class="budget-card ${borderClass}">
                <div class="budget-card-header">
                    <div class="category-icon"><i class="fas ${getCategoryIcon(category)}"></i></div>
                    <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span class="amount">₹${allocated.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${isOver ? 'over-budget' : isWarning ? 'near-budget' : ''}" style="width: ${Math.min(pct, 100)}%"></div>
                </div>
                ${isOver ? `<div class="budget-alert over">⚠ Overspent by ₹${overAmt.toLocaleString()}</div>` : ''}
                ${isWarning ? `<div class="budget-alert warn">⚡ ${pct}% used — approaching limit</div>` : ''}
                <div class="budget-meta">
                    <span>Spent: ₹${spent.toLocaleString()}</span>
                    <span>${pct}% used</span>
                </div>
                ${velocityText}
            </div>`;
        }).join('');

        const sel = $('#expense-category');
        if(sel) sel.innerHTML = entries.map(([cat]) => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');

        const historyList = $('#expense-history-list');
        if (historyList) {
            if (event.expenseLog.length === 0) {
                historyList.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No expenses recorded yet.</td></tr>';
            } else {
                const sortedLogs = [...event.expenseLog].sort((a,b) => new Date(b.date) - new Date(a.date));
                historyList.innerHTML = sortedLogs.map(exp => `
                    <tr>
                        <td>${formatDate(exp.date)}</td>
                        <td>${exp.category}</td>
                        <td>₹${parseInt(exp.amount).toLocaleString()}</td>
                        <td>${exp.note || '-'}</td>
                        <td style="text-align: center;">
                            <button class="btn btn-sm btn-outline delete-expense-btn" data-id="${exp.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');

                historyList.querySelectorAll('.delete-expense-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.dataset.id;
                        event.expenseLog = event.expenseLog.filter(l => l.id !== id);
                        persist();
                        renderBudget(event);
                    });
                });
            }
        }
    };

    $('#add-expense-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event) return;
        const cat = $('#expense-category').value;
        const amt = parseInt($('#expense-amount').value);
        const note = $('#expense-note').value.trim();
        if (!cat || !amt || amt <= 0) { alert('Enter a valid category and amount.'); return; }

        if (!event.expenseLog) event.expenseLog = [];
        event.expenseLog.push({
            id: 'exp-' + Date.now(),
            category: cat,
            amount: amt,
            note: note,
            date: new Date().toISOString()
        });
        
        persist();
        renderBudget(event);
        $('#expense-amount').value = '';
        $('#expense-note').value = '';
        showToast(`₹${amt.toLocaleString()} expense added to ${cat}.`);
    });

    const checkFollowUps = (event) => {
        if (!event.attendees) return 0;
        let flagged = 0;
        const now = new Date();
        event.attendees.forEach(a => {
            if (a.status === 'Invited' && event.autoFollowUp !== false && !a.followUpSent) {
                const addedStr = a.addedAt || event.createdAt || now.toISOString();
                const addedDate = new Date(addedStr);
                const daysSince = Math.floor((now - addedDate) / (1000 * 3600 * 24));
                if (daysSince >= 3) {
                    a.followUpSent = true;
                    a.followUpDate = now.toISOString();
                    a.reminderCount = (a.reminderCount || 0) + 1;
                    flagged++;
                    addNotif(`Auto follow-up triggered for ${a.name} — no response in 3 days for "${event.title}"`);
                }
            }
        });
        if (flagged > 0) persist();
        return flagged;
    };

    $('#ai-budget-toggle').addEventListener('click', () => {
        $('#ai-budget-toggle').classList.toggle('active');
        $('#ai-budget-content').classList.toggle('hidden');
    });

    $('#expense-history-toggle').addEventListener('click', () => {
        $('#expense-history-toggle').classList.toggle('active');
        $('#expense-history-content').classList.toggle('hidden');
    });

    const apiKeyInput = $('#grok-budget-api-key');
    if (apiKeyInput) {
        if (grokBudgetApiKey) {
            apiKeyInput.value = grokBudgetApiKey;
        }
        apiKeyInput.addEventListener('change', (e) => {
            grokBudgetApiKey = e.target.value.trim();
        });
    }

    $('#dismiss-recommendations-btn').addEventListener('click', () => {
        $('#ai-budget-recommendations').style.display = 'none';
    });

    $('#optimize-budget-btn').addEventListener('click', async () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event) return;
        
        if (!grokBudgetApiKey) {
            showToast("Please enter your Grok API key first", 2500);
            return;
        }

        showToast('AI is analyzing your budget...', 0);

        const prompt = `You are an expert Indian event budget consultant. 
Analyze this event budget and give optimization advice.

Event Type: ${event.type}
Total Budget: ₹${event.budget}
Guest Count: ${event.size}
Location: ${event.location}

Current Budget Allocation:
${JSON.stringify(event.budgetSplit)}

Current Actual Spending:
${JSON.stringify(event.expenses)}

Give me exactly 3 specific actionable recommendations to optimize this budget. For each recommendation include:
- Which category to adjust
- How much to increase or decrease (in ₹)
- Why this change makes sense for this event type

Return ONLY a JSON array with 3 objects, each having:
category, action (increase/decrease/reallocate), amount, reason
No other text, just the JSON array.`;

        try {
            const response = await fetch("https://api.x.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${grokBudgetApiKey}`
                },
                body: JSON.stringify({
                    model: "grok-3-mini",
                    messages: [
                        { role: "system", content: "You strictly reply with valid JSON array." },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error("API failed");
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            
            aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
            
            const results = JSON.parse(aiText);
            
            aiToast.classList.add('hidden');
            
            const recPanel = $('#ai-budget-recommendations');
            const recList = $('#ai-recommendations-list');
            
            recList.innerHTML = results.map((rec, idx) => {
                let badgeColor = 'var(--primary)';
                if (rec.action === 'increase') badgeColor = 'var(--success)';
                if (rec.action === 'decrease') badgeColor = 'var(--danger)';
                if (rec.action === 'reallocate') badgeColor = 'var(--warning)';
                
                return `
                <div class="vendor-card" style="display: flex; flex-direction: column;">
                    <div class="vendor-card-header" style="flex-wrap: wrap;">
                        <div class="vendor-icon"><i class="fas ${getCategoryIcon(rec.category)}"></i></div>
                        <div>
                            <h4>${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}</h4>
                            <span class="status-tag" style="background: ${badgeColor}; color: white; border: none; font-size: 0.7rem; padding: 0.1rem 0.5rem; line-height: 1.2;">
                                ${rec.action.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div class="vendor-card-body" style="flex-grow: 1;">
                        <p class="text-sm"><strong>Amount:</strong> ₹${parseInt(rec.amount).toLocaleString()}</p>
                        <p class="text-sm text-muted" style="margin-top: 0.5rem;">${rec.reason}</p>
                    </div>
                    <div class="vendor-card-footer" style="padding-top: 1rem; margin-top: auto; border-top: 1px solid var(--border);">
                        <button class="btn btn-sm btn-primary apply-ai-rec-btn" style="width: 100%;" 
                            data-cat="${rec.category}" 
                            data-action="${rec.action}" 
                            data-amt="${rec.amount}">
                            Apply Recommendation
                        </button>
                    </div>
                </div>`;
            }).join('');
            
            recPanel.style.display = 'block';
            
            recList.querySelectorAll('.apply-ai-rec-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bt = e.currentTarget;
                    const cat = bt.dataset.cat.toLowerCase();
                    const action = bt.dataset.action.toLowerCase();
                    const amt = parseInt(bt.dataset.amt);
                    
                    if (event.budgetSplit[cat] !== undefined) {
                        if (action === 'increase') {
                            event.budgetSplit[cat] += amt;
                        } else if (action === 'decrease') {
                            event.budgetSplit[cat] = Math.max(0, event.budgetSplit[cat] - amt);
                        } else if (action === 'reallocate') {
                            event.budgetSplit[cat] = amt;
                        }
                        persist();
                        renderBudget(event);
                        showToast(`Budget updated for ${cat}!`, 2000);
                        bt.disabled = true;
                        bt.innerText = "Applied ✓";
                        bt.classList.replace('btn-primary', 'btn-outline');
                    }
                });
            });

        } catch (error) {
            console.error("AI Optimization Error:", error);
            aiToast.classList.add('hidden');
            showToast("Optimization failed.", 3000);
            
            $('#ai-budget-recommendations').style.display = 'block';
            $('#ai-recommendations-list').innerHTML = `
                <div style="grid-column: 1 / -1; padding: 1rem; border: 1px solid var(--danger); border-radius: var(--radius-sm); color: var(--danger);">
                    <strong>Error:</strong> Could not parse optimization data. Please check your API key and try again.
                </div>
            `;
        }
    });

    const renderAttendees = (event) => {
        const tbody = $('#attendee-list');
        const rsvpDashboard = $('#rsvp-dashboard');
        const alertsContainer = $('#attendee-alerts-container');
        if (alertsContainer) alertsContainer.innerHTML = '';

        if (!event.attendees || event.attendees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;">No attendees added yet.</td></tr>`;
            if (rsvpDashboard) rsvpDashboard.style.display = 'none';
            $('#email-status').style.display = 'none';
            return;
        }

        const flaggedCount = checkFollowUps(event);
        if (flaggedCount > 0 && alertsContainer) {
            alertsContainer.innerHTML += `
                <div class="rsvp-info-banner" id="followup-banner">
                    <div><i class="fas fa-exclamation-circle"></i> ${flaggedCount} guests have been auto-flagged for follow-up. Click Send Reminders to reach them.</div>
                    <button class="btn btn-sm" style="background:transparent;border:none;color:inherit;" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
                </div>
            `;
        }

        const autoToggle = $('#auto-followup-toggle');
        if (autoToggle) {
            autoToggle.checked = event.autoFollowUp !== false;
            autoToggle.onchange = (e) => {
                event.autoFollowUp = e.target.checked;
                persist();
            };
        }

        const rsvpInput = $('#rsvp-deadline-input');
        if (rsvpInput) {
            rsvpInput.value = event.rsvpDeadline || '';
            $('#set-deadline-btn').onclick = () => {
                if (rsvpInput.value) {
                    event.rsvpDeadline = rsvpInput.value;
                    persist();
                    renderAttendees(event);
                    showToast("RSVP Deadline updated.");
                }
            };
        }

        if (event.rsvpDeadline && alertsContainer) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const deadline = new Date(event.rsvpDeadline);
            const diffDays = Math.floor((deadline - today) / (1000 * 3600 * 24));
            
            const pendingCount = event.attendees.filter(a => a.status === 'Pending' || a.status === 'Invited').length;
            if (pendingCount > 0) {
                if (diffDays < 0) {
                    alertsContainer.innerHTML += `
                        <div class="rsvp-info-banner" style="background:#fee2e2; border-color:#f87171; color:#991b1b;">
                            <div><i class="fas fa-exclamation-triangle"></i> ⚠ RSVP deadline has passed. ${pendingCount} guests have not responded.</div>
                        </div>
                    `;
                } else if (diffDays <= 2) {
                    alertsContainer.innerHTML += `
                        <div class="rsvp-info-banner">
                            <div><i class="fas fa-clock"></i> RSVP deadline is in ${diffDays} days. Send reminders now.</div>
                        </div>
                    `;
                }
            }
        }

        
        const statusEl = $('#email-status');
        if (event.lastEmailAction) {
            const { type, count, date } = event.lastEmailAction;
            const actionDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            statusEl.innerHTML = `<i class="fas fa-info-circle"></i> Last action: ${type} sent to ${count} guest${count !== 1 ? 's' : ''} on ${actionDate}`;
            statusEl.style.display = 'block';
        } else {
            statusEl.style.display = 'none';
        }

        
        $('#reply-to-email').value = state.emailSettings.replyTo || '';
        $('#copy-me-checkbox').checked = state.emailSettings.copyMe || false;

        
        const replyInput = $('#reply-to-email');
        const copyCheck = $('#copy-me-checkbox');
        const settingsToggle = $('#email-settings-toggle');
        const settingsContent = $('#email-settings-content');

        
        settingsToggle.onclick = () => {
            settingsToggle.classList.toggle('active');
            settingsContent.classList.toggle('hidden');
        };

        replyInput.onchange = (e) => {
            state.emailSettings.replyTo = e.target.value;
            persist();
        };

        copyCheck.onchange = (e) => {
            state.emailSettings.copyMe = e.target.checked;
            persist();
        };

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

            let totalResponseDays = 0;
            let respondedCount = 0;
            event.attendees.forEach(a => {
                if ((a.status === 'Confirmed' || a.status === 'Declined') && a.respondedAt && a.addedAt) {
                    const diff = (new Date(a.respondedAt) - new Date(a.addedAt)) / (1000 * 3600 * 24);
                    if (diff >= 0) {
                        totalResponseDays += diff;
                        respondedCount++;
                    }
                }
            });
            const avgResponseTime = respondedCount > 0 ? (totalResponseDays / respondedCount).toFixed(1) + ' days' : 'No responses yet';

            $('#rsvp-analytics-row').innerHTML = `
                <span>Response rate: <strong>${respondedPct}%</strong></span>
                <span>Avg response time: <strong>${avgResponseTime}</strong></span>
            `;

            $('#rsvp-progress-confirmed').style.width = `${pctConf}%`;
            $('#rsvp-progress-declined').style.width = `${pctDecl}%`;
            $('#rsvp-progress-label').innerText = `${respondedPct}% responded`;
        }

        tbody.innerHTML = event.attendees.map((a, idx) => {
            const followBadge = a.followUpSent ? `<span class="followup-badge">Follow-up sent</span>` : '';
            const remCount = a.reminderCount || 0;
            const remDisplay = remCount === 0 ? "—" : (remCount >= 3 ? `<span style="color:var(--danger);font-weight:bold;">${remCount}</span>` : remCount);
            
            return `
                <tr>
                    <td class="bulk-cb-cell" style="display:none;"><input type="checkbox" class="eval-bulk-cb" data-idx="${idx}"></td>
                    <td>${a.name}</td>
                    <td>${a.email}</td>
                    <td><span class="status-tag ${a.status.toLowerCase()}">${a.status}</span> ${followBadge}</td>
                    <td>${a.group || 'General'}</td>
                    <td>${remDisplay}</td>
                    <td style="display:flex;gap:6px;align-items:center;">
                        ${a.status !== 'Confirmed' ? `<button class="btn btn-sm btn-success confirm-btn" data-idx="${idx}">✓ Confirm</button>` : ''}
                        ${a.status !== 'Declined'  ? `<button class="btn btn-sm btn-danger decline-btn" data-idx="${idx}">✗ Decline</button>` : ''}
                        <button class="delete-attendee-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const a = event.attendees[parseInt(btn.dataset.idx)];
                a.status = 'Confirmed';
                a.respondedAt = new Date().toISOString();
                persist(); renderAttendees(event);
            });
        });

        tbody.querySelectorAll('.decline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const a = event.attendees[parseInt(btn.dataset.idx)];
                a.status = 'Declined';
                a.respondedAt = new Date().toISOString();
                persist(); renderAttendees(event);
            });
        });

        tbody.querySelectorAll('.delete-attendee-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                event.attendees.splice(idx, 1);
                persist();
                renderAttendees(event);
            });
        });
    };

    
    const attendeeModal = $('#add-attendee-modal');
    $('#add-attendee-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event) return;
        $('#add-attendee-form').reset();
        attendeeModal.classList.add('active');
    });

    if ($('#add-attendee-form')) {
        $('#add-attendee-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const event = state.events.find(ev => ev.id === state.selectedEventId);
            if (!event) return;
            
            const name = $('#att-name').value.trim();
            const email = $('#att-email').value.trim();
            const group = $('#att-group').value;
            const phone = $('#att-phone').value.trim();
            const note = $('#att-note').value.trim();
            
            event.attendees.push({
                name, email, group,
                status: 'Pending',
                phone: phone || null,
                note: note || null,
                addedAt: new Date().toISOString(),
                followUpSent: false,
                reminderCount: 0,
                followUpDate: null
            });
            persist();
            renderAttendees(event);
            addNotif(`${name} added to "${event.title}".`);
            attendeeModal.classList.remove('active');
        });
    }

    if (attendeeModal) {
        attendeeModal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => attendeeModal.classList.remove('active'));
        });
    }

    
    $('#select-all-pending-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.attendees.length) return;
        
        $('#th-bulk').style.display = 'table-cell';
        $('#bulk-actions-container').style.display = 'flex';
        
        document.querySelectorAll('.bulk-cb-cell').forEach(td => td.style.display = 'table-cell');
        
        let checkedCount = 0;
        document.querySelectorAll('.eval-bulk-cb').forEach((cb) => {
            const idx = parseInt(cb.dataset.idx);
            const status = event.attendees[idx].status;
            if (status === 'Pending' || status === 'Invited') {
                cb.checked = true;
                checkedCount++;
            } else {
                cb.checked = false;
            }
        });
        $('#bulk-select-count').innerText = checkedCount;

        document.querySelectorAll('.eval-bulk-cb').forEach(cb => {
            cb.onchange = () => {
                const checked = document.querySelectorAll('.eval-bulk-cb:checked').length;
                $('#bulk-select-count').innerText = checked;
            };
        });
    });

    $('#cancel-bulk-action-btn').addEventListener('click', () => {
        $('#th-bulk').style.display = 'none';
        $('#bulk-actions-container').style.display = 'none';
        document.querySelectorAll('.bulk-cb-cell').forEach(td => td.style.display = 'none');
        document.querySelectorAll('.eval-bulk-cb').forEach(cb => cb.checked = false);
    });

    $('#apply-bulk-action-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event) return;
        
        const action = $('#bulk-action-select').value;
        if (!action) { alert('Please select an action.'); return; }
        
        const checkboxes = Array.from(document.querySelectorAll('.eval-bulk-cb:checked'));
        if (checkboxes.length === 0) return;
        
        const indices = checkboxes.map(cb => parseInt(cb.dataset.idx)).sort((a,b)=>b-a);
        const now = new Date().toISOString();
        
        if (action === 'confirm' || action === 'decline') {
            const stat = action === 'confirm' ? 'Confirmed' : 'Declined';
            indices.forEach(idx => {
                event.attendees[idx].status = stat;
                event.attendees[idx].respondedAt = now;
            });
            showToast(`Marked ${indices.length} attendees as ${stat}.`);
        } else if (action === 'remove') {
            indices.forEach(idx => {
                event.attendees.splice(idx, 1);
            });
            showToast(`Removed ${indices.length} attendees.`);
        }
        
        persist();
        renderAttendees(event);
        $('#cancel-bulk-action-btn').click();
    });

    
    $('#export-list-btn').addEventListener('click', () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.attendees.length) { alert('No attendees to export.'); return; }
        
        const header = "Name,Email,Status,Group,Reminders,Added Date\n";
        const rows = event.attendees.map(a => {
            return `"${a.name}","${a.email}","${a.status}","${a.group || 'General'}","${a.reminderCount||0}","${a.addedAt || event.createdAt}"`;
        }).join("\n");
        
        const csvContent = header + rows;
        const blob = new Blob([csvContent], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.title.replace(/\s+/g,'_')}_attendees.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    $('#send-invites-btn').addEventListener('click', async () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.attendees.length) { alert('No attendees to invite.'); return; }

        if (typeof emailjs === 'undefined') {
            showToast("Email service unavailable. Check your internet connection.", 3000);
            return;
        }

        const pendingAttendees = event.attendees.filter(a => a.status === 'Pending');
        if (pendingAttendees.length === 0) {
            showToast("No pending invitations to send.", 2000);
            return;
        }

        
        pendingAttendees.forEach(a => a.status = 'Invited');
        persist();
        renderAttendees(event);

        showToast(`Sending invitations to ${pendingAttendees.length} guests...`, 0);

        const emailPromises = pendingAttendees.map(attendee => {
            const params = {
                to_email: attendee.email,
                to_name: attendee.name,
                event_name: event.title,
                event_date: formatDate(event.date),
                event_location: event.location,
                event_type: event.type,
                guest_count: event.size,
                reply_to: state.emailSettings.replyTo || '',
                bcc_to: state.emailSettings.copyMe ? (state.emailSettings.replyTo || '') : ''
            };

            return emailjs.send(ENV.EMAILJS_SERVICE_ID, ENV.EMAILJS_TEMPLATE_ID, params, {
                publicKey: ENV.EMAILJS_PUBLIC_KEY
            })
                .then(() => {
                    return { success: true };
                })
                .catch(err => {
                    console.error("EmailJS Error:", err);
                    alert("EmailJS API Error: " + (err.text || err.message || JSON.stringify(err)));
                    return { success: false, error: err };
                });
        });

        try {
            const results = await Promise.allSettled(emailPromises);
            const successful = results.filter(r => r.value && r.value.success).length;
            const failed = pendingAttendees.length - successful;

            persist();
            renderAttendees(event);

            event.lastEmailAction = {
                type: 'Invitations',
                count: successful,
                date: new Date().toISOString()
            };
            persist();
            renderAttendees(event); 

            if (failed === 0) {
                showToast(`Invitations sent to ${successful} guests!`, 3000);
            } else {
                showToast(`${successful} invitations sent, ${failed} failed. Check email addresses.`, 3000);
            }

            addNotif(`Invitations sent to ${successful} guests for "${event.title}".`);
        } catch (err) {
            showToast("An error occurred while sending emails.", 3000);
        } finally {
             aiToast.classList.add('hidden');
        }
    });

    $('#send-reminders-btn').addEventListener('click', async () => {
        const event = state.events.find(e => e.id === state.selectedEventId);
        if (!event || !event.attendees.length) { alert('No attendees to remind.'); return; }

        if (typeof emailjs === 'undefined') {
            showToast("Email service unavailable. Check your internet connection.", 3000);
            return;
        }

        const total = event.attendees.length;
        const responded = event.attendees.filter(a => a.status === 'Confirmed' || a.status === 'Declined').length;

        if (responded === total) {
            showToast('All guests have responded — no reminders needed!', 2500);
            return;
        }

        const invitedAttendees = event.attendees.filter(a => a.status === 'Invited');
        if (invitedAttendees.length === 0) {
            showToast("No guests to remind. Send invitations first.", 2500);
            return;
        }

        showToast(`Sending reminders to ${invitedAttendees.length} guests...`, 0);

        const today = new Date();
        const eventDate = new Date(event.date);
        const daysUntil = Math.max(0, Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)));

        const emailPromises = invitedAttendees.map(attendee => {
            const params = {
                to_email: attendee.email,
                to_name: attendee.name,
                event_name: event.title,
                event_date: formatDate(event.date),
                event_location: event.location,
                days_until: daysUntil,
                reply_to: state.emailSettings.replyTo || '',
                bcc_to: state.emailSettings.copyMe ? (state.emailSettings.replyTo || '') : ''
            };

            return emailjs.send(ENV.EMAILJS_SERVICE_ID, ENV.EMAILJS_REMINDER_TEMPLATE_ID, params, {
                publicKey: ENV.EMAILJS_PUBLIC_KEY
            })
                .then(() => ({ success: true }))
                .catch(err => {
                    console.error("EmailJS Error:", err);
                    alert("EmailJS API Error: " + (err.text || err.message || JSON.stringify(err)));
                    return { success: false, error: err };
                });
        });

        try {
            const results = await Promise.allSettled(emailPromises);
            const successful = results.filter(r => r.value && r.value.success).length;
            const failed = invitedAttendees.length - successful;

            event.lastEmailAction = {
                type: 'Reminders',
                count: successful,
                date: new Date().toISOString()
            };
            persist();
            renderAttendees(event);

            if (failed === 0) {
                showToast(`Reminders sent to ${successful} guests!`, 3000);
            } else {
                showToast(`${successful} reminders sent, ${failed} failed.`, 3000);
            }

            addNotif(`Reminders sent to ${successful} guests for "${event.title}".`);
        } catch (err) {
            showToast("An error occurred while sending reminders.", 3000);
        } finally {
            aiToast.classList.add('hidden');
        }
    });

    const renderDetailVendors = (event, filter = 'All') => {
        const vendorList = $('#vendor-list');
        const eventLoc = event.eventLoc || resolveLocation(event.location);

        let vendors = VENDOR_DATABASE.map(v => ({
            ...v,
            proximity: getProximityScore(v, eventLoc)
        }));

        if (filter !== 'All') {
            vendors = vendors.filter(v => v.category === filter);
        }

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

    $('#detail-vendor-filters').addEventListener('click', (e) => {
        const tag = e.target.closest('.tag');
        if (!tag) return;
        $$('#detail-vendor-filters .tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        const event = state.events.find(ev => ev.id === state.selectedEventId);
        if (event) renderDetailVendors(event, tag.dataset.filter);
    });

    const renderAIVendors = (vendorsHtml) => {
        const aiContainer = $('#ai-vendor-container');
        const aiList = $('#ai-vendor-list');
        aiList.innerHTML = vendorsHtml;
        aiContainer.style.display = 'block';

        aiList.querySelectorAll('.vendor-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const event = state.events.find(ev => ev.id === state.selectedEventId);
                if (!event) return;

                const rawId = btn.dataset.vid;
                if (!event.selectedVendors) event.selectedVendors = [];
                const idx = event.selectedVendors.indexOf(rawId);
                if (idx > -1) {
                    event.selectedVendors.splice(idx, 1);
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline');
                    btn.innerHTML = 'Select Vendor';
                    btn.closest('.vendor-card').classList.remove('selected-vendor');
                } else {
                    event.selectedVendors.push(rawId);
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-outline');
                    btn.innerHTML = '<i class="fas fa-check"></i> Selected';
                    btn.closest('.vendor-card').classList.add('selected-vendor');
                }
                persist();
            });
        });
    };

    $('#ai-research-vendor-btn').addEventListener('click', async () => {
        const apiKey = $('#grok-api-key').value.trim();
        if (!apiKey) {
            alert('Please enter your Groq API Key first.');
            return;
        }

        const event = state.events.find(ev => ev.id === state.selectedEventId);
        if (!event) return;

        $('#ai-vendor-container').style.display = 'none';
        showToast('AI is researching vendors...', 0);

        const prompt = `You are an expert Indian event planner. Suggest 5 real vendors for a ${event.type} event in ${event.location} with a budget of ₹${event.budget} and ${event.size} guests. For each vendor return ONLY a JSON array with these fields: name, category (one of: Venue/Catering/Decor/Photography), city, estimated_price (as ₹ symbols like ₹₹ or ₹₹₹), rating (4.0-5.0), why_recommended (one sentence). Return only the JSON array, no other text.`;

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            aiToast.classList.add('hidden');

            try {
                let jsonStr = content;
                if (jsonStr.includes('[')) {
                    jsonStr = jsonStr.substring(jsonStr.indexOf('['), jsonStr.lastIndexOf(']') + 1);
                }
                const vendors = JSON.parse(jsonStr);

                const html = vendors.map((v, i) => {
                    const aiVid = `ai-${Date.now()}-${i}`;
                    const isSelected = (event.selectedVendors || []).includes(aiVid);
                    return `
                    <div class="vendor-card ai-vendor-card ${isSelected ? 'selected-vendor' : ''}">
                        <div class="vendor-card-top">
                            <div>
                                <h4>${v.name} <i class="fas fa-robot" style="color:var(--primary);font-size:0.75rem;" title="AI Suggested"></i></h4>
                                <p class="text-sm text-muted">${v.category} • ${v.city}</p>
                            </div>
                            <div class="vendor-rating">${'★'.repeat(Math.floor(v.rating || 5))} <span class="text-sm text-muted">${v.rating}</span></div>
                        </div>
                        <div style="margin: 10px 0; font-size: 0.85rem; font-style: italic; color: var(--text-muted);">
                            "${v.why_recommended}"
                        </div>
                        <div class="vendor-card-bottom">
                            <span class="vendor-price">${v.estimated_price}</span>
                            <button class="btn btn-sm ${isSelected ? 'btn-success' : 'btn-outline'} vendor-select-btn" data-vid="${aiVid}">
                                ${isSelected ? '<i class="fas fa-check"></i> Selected' : 'Select Vendor'}
                            </button>
                        </div>
                    </div>`;
                }).join('');

                renderAIVendors(html);
            } catch (parseErr) {
                console.error("JSON Parse Error", parseErr, content);
                const rawHtml = `
                    <div class="vendor-card ai-vendor-card" style="grid-column: 1 / -1;">
                        <div class="vendor-card-top">
                            <h4>Raw AI Response</h4>
                        </div>
                        <div style="white-space: pre-wrap; font-size: 0.85rem; color: var(--text-muted); margin-top: 10px;">${content}</div>
                    </div>
                `;
                renderAIVendors(rawHtml);
            }
        } catch (err) {
            console.error("Groq API Error", err);
            aiToast.classList.add('hidden');
            showToast('AI research failed. Check your API key and try again.', 3000);
        }
    });

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
            </div>`;

        let atkConfirmed = 0;
        let atkTotal = 0;
        state.events.forEach(ev => {
            if (ev.attendees && ev.attendees.length > 0) {
                atkTotal += ev.attendees.length;
                atkConfirmed += ev.attendees.filter(a => a.status === 'Confirmed').length;
            }
        });
        const atkRate = atkTotal > 0 ? Math.round((atkConfirmed / atkTotal) * 100) : 0;

        const attendanceCardHtml = atkTotal > 0 ? `
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--success) ${atkRate}%, var(--border) 0); display: flex; align-items: center; justify-content: center; position: relative;">
                    <div style="width: 65px; height: 65px; background: var(--bg-card); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700;">${atkRate}%</div>
                </div>
                <div>
                    <h2 style="margin-bottom: 4px;">${atkRate}% Rate</h2>
                    <p class="text-sm text-muted">${atkConfirmed} confirmed out of ${atkTotal} total guests across all events</p>
                </div>
            </div>
        ` : `<p class="text-muted" style="margin-top: 1rem;">No attendee data yet</p>`;

        const budgetCardEvents = [...state.events].sort((a, b) => {
            const getPct = ev => {
                const bgt = parseInt(ev.budget) || 0;
                if (!bgt) return 0;
                let spt = 0;
                if (ev.expenses) Object.values(ev.expenses).forEach(v => spt += v);
                return (spt / bgt) * 100;
            };
            return getPct(b) - getPct(a);
        });

        let budgetListHtml = `<p class="text-muted" style="margin-top: 1rem;">No events yet</p>`;
        if (budgetCardEvents.length > 0) {
            budgetListHtml = `<div style="margin-top: 1rem; max-height: 200px; overflow-y: auto; padding-right: 10px;">` + budgetCardEvents.map(ev => {
                const bgt = parseInt(ev.budget) || 0;
                let spt = 0;
                if (ev.expenses) Object.values(ev.expenses).forEach(v => spt += v);
                const pct = bgt > 0 ? Math.round((spt / bgt) * 100) : 0;
                const name = ev.title.length > 20 ? ev.title.substring(0, 17) + '...' : ev.title;
                const color = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';

                return `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                        <strong>${name}</strong>
                        <span style="color: ${color}; font-weight: 700;">${pct}% (₹${spt.toLocaleString()} / ₹${bgt.toLocaleString()})</span>
                    </div>
                    <div class="progress-bar" style="margin: 0; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${Math.min(pct, 100)}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
                    </div>
                </div>`;
            }).join('') + `</div>`;
        }

        let trCount = 0;
        let trTotalScore = 0;
        let bestVendor = null;
        let trHtmlStr = "";

        state.events.forEach(ev => {
            const svIds = ev.selectedVendors || [];
            if (svIds.length === 0) return;

            let evScore = 0;
            let evCount = 0;

            svIds.forEach(vid => {
                if (typeof vid === 'string' && vid.startsWith('ai-')) return;
                const vendorObj = VENDOR_DATABASE.find(v => v.id === parseInt(vid));
                if (vendorObj && vendorObj.rating) {
                    evScore += vendorObj.rating;
                    evCount++;
                    trTotalScore += vendorObj.rating;
                    trCount++;
                    if (!bestVendor || vendorObj.rating > bestVendor.rating) {
                        bestVendor = vendorObj;
                    }
                }
            });

            if (evCount > 0) {
                const evAvg = (evScore / evCount).toFixed(1);
                trHtmlStr += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <div style="font-size: 0.85rem; font-weight: 600;">${ev.title.length > 20 ? ev.title.substring(0, 17) + '...' : ev.title}</div>
                    <div style="text-align: right;">
                        <div style="color: var(--honey); font-size: 0.9rem;">★ ${evAvg}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${evCount} Vendor(s)</div>
                    </div>
                </div>`;
            }
        });

        let vendorRatingHtml = `<p class="text-muted" style="margin-top: 1rem;">No vendors selected yet</p>`;
        if (trCount > 0 && bestVendor) {
            const overallAvg = (trTotalScore / trCount).toFixed(1);
            vendorRatingHtml = `
                <div style="margin-top: 1rem; display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1rem;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--primary); line-height: 1;">${overallAvg}</div>
                        <div style="color: var(--honey); font-size: 0.9rem;">${'★'.repeat(Math.round(overallAvg))}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Avg across ${trCount} vendor(s)</div>
                    </div>
                    <div style="flex: 1; font-size: 0.8rem;">
                        <span style="color: var(--text-muted);">Highest Rated:</span><br>
                        <strong>${bestVendor.name}</strong> (★${bestVendor.rating})
                    </div>
                </div>
                <div style="max-height: 120px; overflow-y: auto; padding-right: 5px;">
                    ${trHtmlStr}
                </div>
            `;
        }

        let rsvpInvited = 0;
        let rsvpConfirmed = 0;
        let rsvpDeclined = 0;
        state.events.forEach(ev => {
            if (ev.attendees) {
                ev.attendees.forEach(a => {
                    const st = a.status;
                    if (st === 'Invited' || st === 'Confirmed' || st === 'Declined') {
                        rsvpInvited++;
                        if (st === 'Confirmed') rsvpConfirmed++;
                        if (st === 'Declined') rsvpDeclined++;
                    }
                });
            }
        });

        const rsvpResponded = rsvpConfirmed + rsvpDeclined;
        const rsvpPending = rsvpInvited - rsvpResponded;
        const rsvpRate = rsvpInvited > 0 ? Math.round((rsvpResponded / rsvpInvited) * 100) : 0;

        let rsvpHtml = `<p class="text-muted" style="margin-top: 1rem;">No invitations tracked yet</p>`;
        if (rsvpInvited > 0) {
            const pctConf = (rsvpConfirmed / rsvpInvited) * 100;
            const pctDecl = (rsvpDeclined / rsvpInvited) * 100;
            const pctPend = (rsvpPending / rsvpInvited) * 100;

            rsvpHtml = `
                <div style="margin-top: 1rem; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 0.5rem;">
                        <h2 style="margin: 0; color: var(--text-main); font-size: 1.8rem;">${rsvpRate}%</h2>
                        <span class="text-muted text-sm" style="font-weight: 500;">response rate (${rsvpResponded}/${rsvpInvited} guests)</span>
                    </div>

                    <div style="height: 12px; display: flex; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 0.8rem; background: #e5e7eb;">
                        <div style="width: ${pctConf}%; background: var(--success);" title="Confirmed"></div>
                        <div style="width: ${pctDecl}%; background: var(--danger);" title="Declined"></div>
                        <div style="width: ${pctPend}%; background: #9ca3af;" title="Pending"></div>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                        <span><b style="color: var(--success);">${rsvpConfirmed}</b> Confirmed</span>
                        <span><b style="color: var(--danger);">${rsvpDeclined}</b> Declined</span>
                        <span><b style="color: #6b7280;">${rsvpPending}</b> Pending</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML += `
            <div class="analytics-grid" style="margin-bottom: 2rem;">
                <div class="analytics-card">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="stat-icon amber" style="width: 32px; height: 32px; font-size: 0.9rem; border-radius: 6px;"><i class="fas fa-users-check"></i></div>
                        <h4 style="margin: 0;">Attendance Rate</h4>
                    </div>
                    ${attendanceCardHtml}
                </div>

                <div class="analytics-card">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="stat-icon green" style="width: 32px; height: 32px; font-size: 0.9rem; border-radius: 6px;"><i class="fas fa-wallet"></i></div>
                        <h4 style="margin: 0;">Budget Utilization</h4>
                    </div>
                    ${budgetListHtml}
                </div>

                <div class="analytics-card">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="stat-icon honey" style="width: 32px; height: 32px; font-size: 0.9rem; border-radius: 6px;"><i class="fas fa-star"></i></div>
                        <h4 style="margin: 0;">Vendor Ratings Summary</h4>
                    </div>
                    ${vendorRatingHtml}
                </div>

                <div class="analytics-card">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="stat-icon warm" style="width: 32px; height: 32px; font-size: 0.9rem; border-radius: 6px;"><i class="fas fa-envelope-open-text"></i></div>
                        <h4 style="margin: 0;">RSVP Response Rate</h4>
                    </div>
                    ${rsvpHtml}
                </div>
            </div>
        `;

        container.innerHTML += `
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

        const overspentList = Object.entries(catTotals).filter(([cat, allocated]) => (catSpent[cat] || 0) > allocated);
        const overspentHtml = overspentList.length > 0 
            ? overspentList.map(([cat, allocated]) => {
                const spent = catSpent[cat] || 0;
                const over = spent - allocated;
                return `
                <div class="bar-row" style="margin-bottom: 0.5rem; justify-content: space-between; display: flex; align-items: center;">
                    <span class="bar-label" style="flex: 1;">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    <span class="text-sm text-muted" style="flex: 1.5; text-align: center;">Allocated: ₹${allocated.toLocaleString()} &nbsp;|&nbsp; Spent: ₹${spent.toLocaleString()}</span>
                    <span style="color: var(--danger); font-weight: 600; flex: 1; text-align: right;">⚠ Over by ₹${over.toLocaleString()}</span>
                </div>`;
              }).join('')
            : '<div style="color: var(--success); font-weight: 600; text-align: center; padding: 1rem;">✅ All categories within budget</div>';

        container.innerHTML += `
            <div class="analytics-card" style="margin-top: 1.5rem;">
                <h4 style="margin-bottom: 1rem;">Overspent Categories</h4>
                ${overspentHtml}
            </div>`;
    };

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

    document.addEventListener('click', (e) => {
        if (!notifPanel.contains(e.target) && !$('#notif-btn').contains(e.target)) {
            notifPanel.classList.add('hidden');
        }
    });

    const renderFeedbackTab = (event) => {
        const container = $('#feedback-tab');
        if (!event) return;

        let tempRatings = { overall: 0, venue: 0, catering: 0, org: 0 };
        let tempNps = null;

        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0,0,0,0);

        const renderStarsHtml = (group, rating) => {
            let html = '<div class="star-group" data-group="'+group+'">';
            for(let i=1; i<=5; i++) {
                html += `<span class="rating-star" data-val="${i}" style="cursor:pointer; font-size:1.8rem; color:${i<=rating ? 'var(--honey)' : 'var(--border)'}; margin-right:4px;">${i<=rating ? '★' : '☆'}</span>`;
            }
            html += '</div>';
            return html;
        };

        if (event.feedback) {
            const f = event.feedback;
            const avg = ((f.overallRating + f.venueRating + f.cateringRating + f.organizationRating)/4).toFixed(1);
            container.innerHTML = `
                <div class="feedback-summary card" style="max-width: 600px; margin: 0 auto; background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 3rem; color: var(--success);"><i class="fas fa-check-circle"></i></div>
                        <h2>Feedback Recorded!</h2>
                        <div style="font-size: 1.5rem; color: var(--honey); font-weight: 700; margin-top: 0.5rem;">${avg}/5 Average Rating</div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                        <div><span class="text-muted text-sm">Overall</span><br>${renderStarsHtml('x', f.overallRating).replace(/cursor:pointer/g, 'cursor:default')}</div>
                        <div><span class="text-muted text-sm">Venue</span><br>${renderStarsHtml('x', f.venueRating).replace(/cursor:pointer/g, 'cursor:default')}</div>
                        <div><span class="text-muted text-sm">Catering</span><br>${renderStarsHtml('x', f.cateringRating).replace(/cursor:pointer/g, 'cursor:default')}</div>
                        <div><span class="text-muted text-sm">Organization</span><br>${renderStarsHtml('x', f.organizationRating).replace(/cursor:pointer/g, 'cursor:default')}</div>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <span class="text-muted text-sm">What went well</span>
                        <p style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm); margin-top: 4px;">${f.wentWell || '<i>No comments</i>'}</p>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <span class="text-muted text-sm">What to improve</span>
                        <p style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-sm); margin-top: 4px;">${f.improve || '<i>No comments</i>'}</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <span class="text-muted text-sm">Would you recommend?</span>
                        <div style="font-weight: 600; margin-top: 4px; color: var(--primary);">${f.nps}</div>
                    </div>

                    <button class="btn btn-outline" id="resubmit-feedback-btn" style="width: 100%;"><i class="fas fa-redo"></i> Re-submit Feedback</button>
                </div>
            `;

            $('#resubmit-feedback-btn').addEventListener('click', () => {
                delete event.feedback;
                persist();
                renderFeedbackTab(event);
            });
            return;
        }

        if (eventDate > today) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 4rem 1rem;">
                    <div class="empty-icon" style="color: var(--success);"><i class="fas fa-seedling"></i></div>
                    <h3>Event Not Yet Completed</h3>
                    <p>Feedback will be available after your event on <b>${formatDate(event.date)}</b>.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="feedback-form" style="max-width: 600px; margin: 0 auto; background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1.5rem; text-align: center;">Post-Event Feedback</h3>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px;">Overall Rating*</label>
                    <div id="fb-stars-overall">${renderStarsHtml('overall', 0)}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 4px;">Venue</label>
                        <div id="fb-stars-venue">${renderStarsHtml('venue', 0)}</div>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 4px;">Catering</label>
                        <div id="fb-stars-catering">${renderStarsHtml('catering', 0)}</div>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 4px;">Organization</label>
                        <div id="fb-stars-org">${renderStarsHtml('org', 0)}</div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label>What went well?</label>
                    <textarea class="form-control" id="fb-went-well" rows="3" placeholder="What worked great?"></textarea>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label>What to improve?</label>
                    <textarea class="form-control" id="fb-improve" rows="3" placeholder="What could be better?"></textarea>
                </div>

                <div style="margin-bottom: 2rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 8px;">Would you recommend this event?*</label>
                    <div style="display: flex; gap: 1rem;" id="fb-nps-group">
                        <button class="btn btn-outline fb-nps-btn" data-val="Yes">Yes</button>
                        <button class="btn btn-outline fb-nps-btn" data-val="Maybe">Maybe</button>
                        <button class="btn btn-outline fb-nps-btn" data-val="No">No</button>
                    </div>
                </div>

                <button class="btn btn-success" id="submit-feedback-btn" style="width: 100%;"><i class="fas fa-paper-plane"></i> Submit Feedback</button>
            </div>
        `;

        const attachStarLogic = (groupStr, keyStr) => {
            const groupEl = container.querySelector(('#fb-stars-'+groupStr) + ' .star-group');
            if(!groupEl) return;
            const stars = groupEl.querySelectorAll('.rating-star');

            stars.forEach(star => {
                star.addEventListener('mouseenter', () => {
                    const val = parseInt(star.dataset.val);
                    stars.forEach(s => {
                        const sVal = parseInt(s.dataset.val);
                        s.innerText = sVal <= val ? '★' : '☆';
                        s.style.color = sVal <= val ? 'var(--honey)' : 'var(--border)';
                    });
                });

                star.addEventListener('mouseleave', () => {
                    const activeVal = tempRatings[keyStr];
                    stars.forEach(s => {
                        const sVal = parseInt(s.dataset.val);
                        s.innerText = sVal <= activeVal ? '★' : '☆';
                        s.style.color = sVal <= activeVal ? 'var(--honey)' : 'var(--border)';
                    });
                });

                star.addEventListener('click', () => {
                    tempRatings[keyStr] = parseInt(star.dataset.val);
                });
            });
        };

        attachStarLogic('overall', 'overall');
        attachStarLogic('venue', 'venue');
        attachStarLogic('catering', 'catering');
        attachStarLogic('org', 'org');

        container.querySelectorAll('.fb-nps-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.fb-nps-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-outline');
                });
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-outline');
                tempNps = btn.dataset.val;
            });
        });

        $('#submit-feedback-btn').addEventListener('click', () => {
            if (tempRatings.overall === 0) {
                alert("Please provide an overall rating");
                return;
            }
            if (!tempNps) {
                alert("Please answer if you would recommend this event");
                return;
            }

            event.feedback = {
                overallRating: tempRatings.overall,
                venueRating: tempRatings.venue,
                cateringRating: tempRatings.catering,
                organizationRating: tempRatings.org,
                wentWell: $('#fb-went-well').value.trim(),
                improve: $('#fb-improve').value.trim(),
                nps: tempNps,
                submittedAt: new Date().toISOString()
            };

            persist();

            addNotif(`Feedback submitted for "${event.title}"`);

            renderFeedbackTab(event);
        });
    };

    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.add('hidden'));

            btn.classList.add('active');
            const tabName = btn.dataset.tab;

            const tabMap = {
                'timeline': 'timeline-tab',
                'budget': 'budget-tab',
                'attendees': 'attendees-tab',
                'vendors': 'event-vendors-tab',
                'feedback': 'feedback-tab'
            };
            const tabEl = document.getElementById(tabMap[tabName]);
            if (tabEl) tabEl.classList.remove('hidden');
        });
    });

    $('#theme-toggle').addEventListener('click', () => {
        state.isDarkMode = !state.isDarkMode;
        document.body.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
        $('#theme-toggle').innerHTML = state.isDarkMode
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });

    updateDashboard();
    renderNotifications();
});
