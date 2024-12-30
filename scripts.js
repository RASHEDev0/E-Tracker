document.addEventListener('DOMContentLoaded', () => {
    populateDayOptions();
    reloadSavedTrackers();
    document.getElementById('trackerForm').addEventListener('submit', saveMood);
    document.getElementById('addTrackerBtn').addEventListener('click', showPopup);
    document.getElementById('editTrackerBtn').addEventListener('click', showEditPopup); // Add event listener for edit button
    document.querySelectorAll('.popup .close').forEach(closeBtn => closeBtn.addEventListener('click', hidePopup));
    document.getElementById('newTrackerForm').addEventListener('submit', saveTracker);
    document.getElementById('editTrackerForm').addEventListener('submit', saveEditedTracker); // Add event listener for save edit button
    document.getElementById('addOptionBtn').addEventListener('click', addOption);
    document.getElementById('editAddOptionBtn').addEventListener('click', addEditOption); // Add event listener for adding options in edit mode
    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', switchTab));
    document.getElementById('optionsContainer').addEventListener('change', handleColorChange);
    document.getElementById('deleteTrackerBtn').addEventListener('click', deleteCurrentTracker);
});

function populateDayOptions() {
    const daySelect = document.getElementById('day');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
}

function reloadSavedTrackers() {
    // Retrieve tracker names from localStorage
    const keys = Object.keys(localStorage);
    const moodTrackerDeleted = localStorage.getItem('lastDeletedMoodTracker') === 'true';

    keys.forEach(key => {
        if (key.endsWith('Options')) {
            const trackerName = key.replace('Options', '');
            const optionsData = JSON.parse(localStorage.getItem(key)) || { options: [], colors: [] };
            if (trackerName !== 'moodTracker' || !moodTrackerDeleted) {
                addTrackerTab(trackerName, optionsData.options, optionsData.colors, false);
            }
        }
    });

    // If no trackers are left, re-add Mood Tracker unless it was deleted
    const trackerTabs = document.querySelectorAll('.tab');
    if (trackerTabs.length === 0 && !moodTrackerDeleted) {
        addTrackerTab('moodTracker', ['happy', 'sad', 'neutral', 'angry', 'excited'], ['yellow', 'blue', 'gray', 'red', 'green']);
        populateTable('moodTracker');
        loadMoods('moodTracker');
        updateFormOptions('moodTracker');
    }
}

function populateTable(tracker) {
    const tbody = document.createElement('tbody');
    for (let i = 1; i <= 31; i++) {
        const row = document.createElement('tr');
        const dayCell = document.createElement('td');
        dayCell.textContent = i;
        row.appendChild(dayCell);

        for (let j = 1; j <= 12; j++) {
            const cell = document.createElement('td');
            cell.dataset.day = i;
            cell.dataset.month = j;
            cell.dataset.tracker = tracker;
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    document.getElementById('trackerContent').innerHTML = '';
    const table = document.createElement('table');
    table.id = tracker + 'Table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Day</th>
                <th>Jan</th>
                <th>Feb</th>
                <th>Mar</th>
                <th>Apr</th>
                <th>May</th>
                <th>Jun</th>
                <th>Jul</th>
                <th>Aug</th>
                <th>Sep</th>
                <th>Oct</th>
                <th>Nov</th>
                <th>Dec</th>
            </tr>
        </thead>`;
    table.appendChild(tbody);
    document.getElementById('trackerContent').appendChild(table);
}

function saveMood(e) {
    e.preventDefault();

    const day = document.getElementById('day').value;
    const month = document.getElementById('month').value;
    const mood = document.getElementById('trackerOption').value;
    const tracker = document.querySelector('.tab.active').dataset.tracker;
    const tableId = tracker + 'Table';

    const cell = document.querySelector(`#${tableId} td[data-day='${day}'][data-month='${month}']`);
    if (cell) {
        cell.dataset.mood = mood;

        // Apply the color of the selected option
        const optionsData = JSON.parse(localStorage.getItem(tracker + 'Options')) || { options: [], colors: [] };
        const optionIndex = optionsData.options.indexOf(mood);
        const color = optionsData.colors[optionIndex] || '';
        cell.style.backgroundColor = color;
    }

    // Save the mood data to localStorage
    const moods = JSON.parse(localStorage.getItem(tracker) || '[]');
    const existingEntryIndex = moods.findIndex(entry => entry.day == day && entry.month == month);

    if (existingEntryIndex !== -1) {
        moods[existingEntryIndex].mood = mood;
    } else {
        moods.push({ day, month, mood });
    }

    localStorage.setItem(tracker, JSON.stringify(moods));
}

function loadMoods(tracker) {
    const moods = JSON.parse(localStorage.getItem(tracker) || '[]');

    moods.forEach(entry => {
        const tableId = tracker + 'Table';
        const cell = document.querySelector(`#${tableId} td[data-day='${entry.day}'][data-month='${entry.month}']`);
        if (cell) {
            cell.dataset.mood = entry.mood;

            // Apply the color of the loaded option
            const optionsData = JSON.parse(localStorage.getItem(tracker + 'Options')) || { options: [], colors: [] };
            const optionIndex = optionsData.options.indexOf(entry.mood);
            const color = optionsData.colors[optionIndex] || '';
            cell.style.backgroundColor = color;
        }
    });
}

function showPopup() {
    document.getElementById('trackerPopup').style.display = 'flex';
    handleColorChange(); // Initialize the color change handler for the first option
}

function hidePopup() {
    document.querySelectorAll('.popup').forEach(popup => popup.style.display = 'none');
}

let addOptionClickCount = 0;

function addOption() {
    addOptionClickCount++;
    
    if (addOptionClickCount >= 7) {
        document.getElementById('addOptionBtn').style.display = 'none';
        return;
    }

    const optionsContainer = document.getElementById('optionsContainer');
    const optionCount = optionsContainer.querySelectorAll('input').length + 1;
    
    const optionDiv = document.createElement('div');
    optionDiv.innerHTML = `
        <label for="option${optionCount}">Option ${optionCount}:</label>
        <input type="text" id="option${optionCount}" name="option${optionCount}" required>
        <select id="color${optionCount}" name="color${optionCount}" required>
            <option value="">Select Color</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="gray">Gray</option>
            <option value="blue">Blue</option>
            <option value="black">Black</option>
        </select>`;
    optionsContainer.appendChild(optionDiv);

    handleColorChange();
}

function addEditOption() {
    const editOptionsContainer = document.getElementById('editOptionsContainer');
    const optionCount = editOptionsContainer.querySelectorAll('input').length + 1;

    const optionDiv = document.createElement('div');
    optionDiv.innerHTML = `
        <label for="editOption${optionCount}">Option ${optionCount}:</label>
        <input type="text" id="editOption${optionCount}" name="editOption${optionCount}" required>
        <select id="editColor${optionCount}" name="editColor${optionCount}" required>
            <option value="">Select Color</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="gray">Gray</option>
            <option value="blue">Blue</option>
            <option value="black">Black</option>
        </select>`;
    editOptionsContainer.appendChild(optionDiv);
}

function saveTracker(e) {
    e.preventDefault();

    const trackerName = document.getElementById('trackerName').value;
    const options = [];
    const colors = [];
    const optionInputs = document.querySelectorAll('#optionsContainer input');
    const colorSelects = document.querySelectorAll('#optionsContainer select');

    optionInputs.forEach((input, index) => {
        options.push(input.value);
        colors.push(colorSelects[index].value);
    });

    addTrackerTab(trackerName, options, colors);

    // Hide the popup after saving the tracker
    hidePopup();
}

function saveEditedTracker(e) {
    e.preventDefault();

    const trackerName = document.getElementById('editTrackerName').value;
    const options = [];
    const colors = [];
    const optionInputs = document.querySelectorAll('#editOptionsContainer input');
    const colorSelects = document.querySelectorAll('#editOptionsContainer select');

    optionInputs.forEach((input, index) => {
        options.push(input.value);
        colors.push(colorSelects[index].value);
    });

    localStorage.setItem(trackerName + 'Options', JSON.stringify({ options, colors }));

    // Update the form options and table for the edited tracker
    updateFormOptions(trackerName);
    loadMoods(trackerName);

    // Hide the popup after saving the changes
    hidePopup();
}

function addTrackerTab(trackerName, options, colors, save = true) {
    const tabs = document.getElementById('tabs');

    // Check if the tracker already exists
    const existingTab = document.querySelector(`.tab[data-tracker="${trackerName}"]`);
    if (!existingTab) {
        const tab = document.createElement('li');
        tab.classList.add('tab');
        tab.dataset.tracker = trackerName;
        tab.textContent = trackerName;
        tab.addEventListener('click', switchTab);

        tabs.appendChild(tab);

        if (save) {
            // Store tracker options and colors in localStorage
            localStorage.setItem(trackerName + 'Options', JSON.stringify({ options, colors }));
        }

        // Show the delete icon when a tracker tab is added
        showDeleteIcon();
    }
}

function switchTab(e) {
    const selectedTab = e.target;
    const trackerName = selectedTab.dataset.tracker;

    // Remove active class from all tabs and add to the selected tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    selectedTab.classList.add('active');

    // Update the tracker title and convert to uppercase
    let trackerTitle = trackerName;
    if (!trackerName.includes('Tracker')) {
        trackerTitle = `${trackerName} Tracker`;
    }
    // Insert a space before "Tracker" if needed
    trackerTitle = trackerTitle.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();

    document.getElementById('trackerTitle').textContent = trackerTitle;

    // Update the label for the tracker option
    document.getElementById('trackerLabel').textContent = trackerName + ':';

    // Update the options for the tracker dropdown
    updateFormOptions(trackerName);

    // Create a new table for the selected tracker
    populateTable(trackerName);

    // Load the moods for the selected tracker
    loadMoods(trackerName);

    // Show the delete icon for the active tracker
    showDeleteIcon();
}

function updateFormOptions(trackerName) {
    const storedData = JSON.parse(localStorage.getItem(trackerName + 'Options') || '{}');
    const options = storedData.options || [];
    const colors = storedData.colors || [];
    const trackerOptionSelect = document.getElementById('trackerOption');
    trackerOptionSelect.innerHTML = '';

    options.forEach((option, index) => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        opt.dataset.color = colors[index];
        trackerOptionSelect.appendChild(opt);
    });

    // Set default options for Mood Tracker
    if (trackerName === 'moodTracker') {
        trackerOptionSelect.innerHTML = `
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="neutral">Neutral</option>
            <option value="angry">Angry</option>
            <option value="excited">Excited</option>
        `;
    }
}

function handleColorChange() {
    const selectedColors = new Set();
    const colorSelects = document.querySelectorAll('#optionsContainer select');

    colorSelects.forEach(select => {
        if (select.value) {
            selectedColors.add(select.value);
        }
    });

    colorSelects.forEach(select => {
        const currentColor = select.value;
        while (select.options.length > 1) {
            select.remove(1);
        }

        const colors = ['red', 'orange', 'green', 'yellow', 'gray', 'blue', 'black'];
        colors.forEach(color => {
            if (!selectedColors.has(color) || color === currentColor) {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
                select.appendChild(option);
            }
        });

        select.value = currentColor;
    });
}

function showDeleteIcon() {
    const deleteIconContainer = document.getElementById('trashIconContainer');
    const numberOfTabs = document.querySelectorAll('.tab').length;

    if (numberOfTabs > 1) {
        deleteIconContainer.style.display = 'block';
    } else {
        deleteIconContainer.style.display = 'none';
    }
}

function deleteCurrentTracker() {
    const activeTab = document.querySelector('.tab.active');
    const trackerName = activeTab.dataset.tracker;

    // Remove tracker data from localStorage
    localStorage.removeItem(trackerName + 'Options');
    localStorage.removeItem(trackerName);

    // Track if Mood Tracker is deleted
    if (trackerName === 'moodTracker') {
        localStorage.setItem('lastDeletedMoodTracker', true);
    }

    // Remove the tracker tab
    activeTab.remove();

    // Hide the delete icon if only one tab remains
    showDeleteIcon();

    // Switch to the remaining tracker
    const remainingTabs = document.querySelectorAll('.tab');
    if (remainingTabs.length > 0) {
        const firstTab = remainingTabs[0];
        firstTab.classList.add('active');
        switchTab({ target: firstTab });
    }
}

function showEditPopup() {
    const activeTab = document.querySelector('.tab.active');
    const trackerName = activeTab.dataset.tracker;
    const optionsData = JSON.parse(localStorage.getItem(trackerName + 'Options')) || { options: [], colors: [] };

    document.getElementById('editTrackerName').value = trackerName;
    const editOptionsContainer = document.getElementById('editOptionsContainer');
    editOptionsContainer.innerHTML = '';

    optionsData.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.innerHTML = `
            <label for="editOption${index + 1}">Option ${index + 1}:</label>
            <input type="text" id="editOption${index + 1}" name="editOption${index + 1}" value="${option}" required>
            <select id="editColor${index + 1}" name="editColor${index + 1}" required>
                <option value="">Select Color</option>
                <option value="red" ${optionsData.colors[index] === 'red' ? 'selected' : ''}>Red</option>
                <option value="orange" ${optionsData.colors[index] === 'orange' ? 'selected' : ''}>Orange</option>
                <option value="green" ${optionsData.colors[index] === 'green' ? 'selected' : ''}>Green</option>
                <option value="yellow" ${optionsData.colors[index] === 'yellow' ? 'selected' : ''}>Yellow</option>
                <option value="gray" ${optionsData.colors[index] === 'gray' ? 'selected' : ''}>Gray</option>
                <option value="blue" ${optionsData.colors[index] === 'blue' ? 'selected' : ''}>Blue</option>
                <option value="black" ${optionsData.colors[index] === 'black' ? 'selected' : ''}>Black</option>
            </select>`;
        editOptionsContainer.appendChild(optionDiv);
    });

    document.getElementById('editTrackerPopup').style.display = 'flex';
}
