        // ===== Quick Log (Past Event) =====
        function showQuickLog() {
            var walkSection = document.getElementById('walkthrough');
            // Default date: today
            var today = new Date();
            var defaultDate = today.toISOString().slice(0, 10);

            // Get inventory for product selection
            var inventory = InventoryManager.getAll();

            var html = '';
            html += '<div style="margin-bottom:1rem;">';
            html += '<button class="btn-secondary" id="quick-log-cancel" aria-label="Cancel and go back">\u2190 Cancel</button>';
            html += '</div>';
            html += '<div class="card">';
            html += '<h3 style="color:var(--gold);margin-bottom:1rem;">Log a wash day</h3>';

            // Date
            html += '<label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.4rem;">When?</label>';
            html += '<input type="date" id="quick-log-date" value="' + defaultDate + '" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:0.6rem 0.75rem;font-size:0.9rem;margin-bottom:1.25rem;min-height:48px;">';

            // What did you do? (multi-select)
            html += '<label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">What did you do? <span style="color:var(--muted);">(select all that apply)</span></label>';
            html += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem;" id="quick-log-activities">';
            html += '<button class="btn-secondary quick-activity-btn" data-activity="wash" style="border-color:var(--green);color:var(--green);">Wash</button>';
            html += '<button class="btn-secondary quick-activity-btn" data-activity="clarify">Clarify</button>';
            html += '<button class="btn-secondary quick-activity-btn" data-activity="deep-condition">Deep condition</button>';
            html += '<button class="btn-secondary quick-activity-btn" data-activity="bond-repair">Bond repair</button>';
            html += '<button class="btn-secondary quick-activity-btn" data-activity="protein">Protein</button>';
            html += '</div>';

            // Style lane (single-select, shown when wash or clarify is selected)
            html += '<div id="quick-log-lane-section">';
            html += '<label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">How did you style?</label>';
            html += '<div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;" id="quick-log-lanes">';
            html += '<button class="btn-secondary quick-lane-btn" data-lane="curly" style="border-color:var(--green);color:var(--green);">\uD83C\uDF00 Curly</button>';
            html += '<button class="btn-secondary quick-lane-btn" data-lane="blowout">\uD83D\uDCA8 Blowout</button>';
            html += '<button class="btn-secondary quick-lane-btn" data-lane="refresh">\u2728 Air dry</button>';
            html += '</div>';
            html += '</div>';

            // Products (populated dynamically based on lane)
            html += '<label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">Which products? <span style="color:var(--muted);">(tap all that apply)</span></label>';
            html += '<div id="quick-log-products" style="margin-bottom:1.25rem;"></div>';

            // Rating
            html += '<label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">How did it turn out? <span style="color:var(--muted);">(optional)</span></label>';
            html += '<div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;" id="quick-log-rating">';
            html += '<button class="btn-secondary quick-rating-btn" data-rating="1" style="font-size:1.3rem;padding:0.4rem 0.6rem;">\uD83D\uDE2B</button>';
            html += '<button class="btn-secondary quick-rating-btn" data-rating="2" style="font-size:1.3rem;padding:0.4rem 0.6rem;">\uD83D\uDE15</button>';
            html += '<button class="btn-secondary quick-rating-btn" data-rating="3" style="font-size:1.3rem;padding:0.4rem 0.6rem;">\uD83D\uDE10</button>';
            html += '<button class="btn-secondary quick-rating-btn" data-rating="4" style="font-size:1.3rem;padding:0.4rem 0.6rem;">\uD83D\uDE0A</button>';
            html += '<button class="btn-secondary quick-rating-btn" data-rating="5" style="font-size:1.3rem;padding:0.4rem 0.6rem;">\uD83E\uDD29</button>';
            html += '</div>';

            html += '<button class="btn-primary" id="quick-log-save" style="width:100%;margin-top:0.5rem;">Save</button>';
            html += '</div>';

            showView('walkthrough');
            document.querySelectorAll('nav button[data-view]').forEach(function(b) { b.setAttribute('aria-current', 'false'); });
            walkSection.innerHTML = html;

            // State
            var selectedActivities = ['wash']; // wash selected by default
            var quickLane = 'curly';
            var selectedProducts = [];
            var selectedRating = null;

            // Render products for current lane
            function renderProductsForLane(lane) {
                var productsDiv = document.getElementById('quick-log-products');
                selectedProducts = [];

                var relevantContexts = ['every-wash'];
                if (lane === 'curly') relevantContexts.push('curly');
                if (lane === 'blowout') relevantContexts.push('blowout');
                relevantContexts.push('weekly');
                relevantContexts.push('as-needed');

                var relevantProducts = inventory.filter(function(p) {
                    return relevantContexts.indexOf(p.context) !== -1;
                });

                var tierOrder = { 'primary': 0, 'supporting': 1, 'use-up': 2 };
                relevantProducts.sort(function(a, b) {
                    return (tierOrder[a.tier] || 2) - (tierOrder[b.tier] || 2);
                });

                var pHtml = '<div class="product-grid" style="gap:0.4rem;">';
                for (var i = 0; i < relevantProducts.length; i++) {
                    var prod = relevantProducts[i];
                    var tierStyle = prod.tier === 'use-up' ? ' style="opacity:0.6;"' : '';
                    pHtml += '<button class="btn-secondary quick-product-btn" data-product-id="' + escapeHtml(prod.id) + '"' + tierStyle + '>';
                    pHtml += escapeHtml(prod.name);
                    if (prod.tier === 'use-up') pHtml += ' <span style="font-size:0.65rem;color:var(--muted);">(using up)</span>';
                    pHtml += '</button>';
                }
                pHtml += '</div>';
                productsDiv.innerHTML = pHtml;

                productsDiv.querySelectorAll('.quick-product-btn').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var prodId = btn.getAttribute('data-product-id');
                        var idx = selectedProducts.indexOf(prodId);
                        if (idx === -1) {
                            selectedProducts.push(prodId);
                            btn.style.borderColor = 'var(--green)';
                            btn.style.color = 'var(--green)';
                        } else {
                            selectedProducts.splice(idx, 1);
                            btn.style.borderColor = '';
                            btn.style.color = '';
                        }
                    });
                });
            }

            renderProductsForLane(quickLane);

            // Wire cancel
            document.getElementById('quick-log-cancel').addEventListener('click', function() {
                showView('landing');
                document.querySelector('nav button[data-view="landing"]').setAttribute('aria-current', 'true');
            });

            // Wire activity buttons (multi-select)
            walkSection.querySelectorAll('.quick-activity-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var activity = btn.getAttribute('data-activity');
                    var idx = selectedActivities.indexOf(activity);
                    if (idx === -1) {
                        selectedActivities.push(activity);
                        btn.style.borderColor = 'var(--green)';
                        btn.style.color = 'var(--green)';
                    } else {
                        selectedActivities.splice(idx, 1);
                        btn.style.borderColor = '';
                        btn.style.color = '';
                    }
                });
            });

            // Wire lane buttons (single-select, re-renders products)
            walkSection.querySelectorAll('.quick-lane-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    quickLane = btn.getAttribute('data-lane');
                    walkSection.querySelectorAll('.quick-lane-btn').forEach(function(b) {
                        b.style.borderColor = '';
                        b.style.color = '';
                    });
                    btn.style.borderColor = 'var(--green)';
                    btn.style.color = 'var(--green)';
                    renderProductsForLane(quickLane);
                });
            });

            // Wire rating buttons (single-select)
            walkSection.querySelectorAll('.quick-rating-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    selectedRating = parseInt(btn.getAttribute('data-rating'));
                    walkSection.querySelectorAll('.quick-rating-btn').forEach(function(b) {
                        b.style.borderColor = '';
                        b.style.background = '';
                    });
                    btn.style.borderColor = 'var(--gold)';
                    btn.style.background = 'rgba(212, 165, 116, 0.15)';
                });
            });

            // Wire save button
            document.getElementById('quick-log-save').addEventListener('click', function() {
                submitQuickLog(quickLane, selectedProducts, selectedActivities, selectedRating);
            });
        }

        function submitQuickLog(lane, products, activities, rating) {
            var dateInput = document.getElementById('quick-log-date');
            var dateStr = dateInput ? dateInput.value : null;
            if (!dateStr) {
                alert('Please select a date.');
                return;
            }

            var eventDate = new Date(dateStr + 'T12:00:00');

            // Build treatments from activities
            var treatments = [];
            if (activities.indexOf('clarify') !== -1) treatments.push('clarify');
            if (activities.indexOf('protein') !== -1) treatments.push('protein');
            if (activities.indexOf('deep-condition') !== -1) treatments.push('deep-condition');
            if (activities.indexOf('bond-repair') !== -1) treatments.push('bond-repair');

            // Auto-detect from products too
            if (products.indexOf('everpure-clarifying') !== -1 && treatments.indexOf('clarify') === -1) {
                treatments.push('clarify');
            }
            if ((products.indexOf('garnier-pre-shampoo') !== -1 || products.indexOf('ogx-bond-protein-pre') !== -1 || products.indexOf('olaplex-3') !== -1) && treatments.indexOf('protein') === -1) {
                treatments.push('protein');
            }

            // Calculate interval days
            var state = StateManager.getState();
            var events = state.events || [];
            var intervalDays = 0;
            if (events.length > 0) {
                var prevEvents = events.filter(function(e) {
                    return new Date(e.date) < eventDate;
                });
                if (prevEvents.length > 0) {
                    var lastPrev = prevEvents[prevEvents.length - 1];
                    var lastDate = new Date(lastPrev.date);
                    var diffMs = eventDate.getTime() - lastDate.getTime();
                    intervalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                }
            }

            var washEvent = {
                id: generateUUID(),
                date: eventDate.toISOString(),
                lane: lane,
                treatments: treatments,
                products: products,
                humidity: 'moderate',
                dewPoint: null,
                rating: rating || null,
                intervalDays: intervalDays,
                overrides: [],
                notes: ''
            };

            StateManager.saveWashEvent(washEvent);
            updateSealState(washEvent);
            FeedbackEngine.analyze();

            showView('landing');
            document.querySelectorAll('nav button[data-view]').forEach(function(b) { b.setAttribute('aria-current', 'false'); });
            document.querySelector('nav button[data-view="landing"]').setAttribute('aria-current', 'true');
            renderLanding();
            renderHistory();
        }

