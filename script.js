document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyh5hy-CuaafLA7dx1taTuAALAplYhOzAl3RHAMs8r5l7tRgyIMnamWWOHSTzCwXA5amg/exec'; // IMPORTANT: Replace this URL
    const STUDENT_DOMAIN = '@student.annauniv.edu';
    const DISCOUNT_PERCENTAGE = 0.6; // 60% off

    // --- STATE MANAGEMENT ---
    const surveyData = {
        timestamp: new Date().toISOString(),
        ipAddress: '',
        step1_choice: null,
        step2_studentEmail: null,
        step3_name: null,
        step3_phone: null,
        step3_email: null,
    };

    // --- HELPER FUNCTION TO SEND DATA ---
    const sendData = (data) => {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(err => console.error('Error sending data:', err));
    };
    
    // --- GET USER IP ---
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => { surveyData.ip = data.ip; }) // <-- CHANGE THIS LINE
        .catch(() => { surveyData.ip = 'Not Found'; });


    // --- STEP 1: T-SHIRT SELECTION ---
    const tshirtCards = document.querySelectorAll('.tshirt-card');
    const continueBtn = document.getElementById('continueBtn');
    
    // --- FIX: RESTORED THIS ENTIRE CODE BLOCK ---
    tshirtCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove 'selected' from all other cards
            tshirtCards.forEach(c => c.classList.remove('selected'));
            // Add 'selected' to the clicked card
            card.classList.add('selected');
            // Store the choice
            surveyData.step1_choice = card.getAttribute('data-choice');
            // Enable the continue button
            continueBtn.disabled = false;
        });
    });
    // --- END OF RESTORED CODE BLOCK ---

    continueBtn.addEventListener('click', () => {
        // Track this action
        sendData({ ip: surveyData.ipAddress, timestamp: new Date().toISOString(), action: 'Selected T-Shirt', choice: surveyData.step1_choice });
        
        const step1Section = document.getElementById('step1');
        const step2Section = document.getElementById('step2');
        const step3Section = document.getElementById('step3');
        
        step1Section.classList.add('hidden');
        step2Section.classList.remove('hidden');
        step3Section.classList.remove('hidden');

        // FIX: Smoothly scroll to the top of Step 2 to prevent jumping to the form
        step2Section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // --- STEP 2: STUDENT EMAIL VALIDATION & PRICE SLASH ---
    const studentEmailInput = document.getElementById('studentEmail');
    const verifyBtn = document.getElementById('verifyEmailBtn');
    const discountMessage = document.getElementById('discountMessage');

    verifyBtn.addEventListener('click', () => {
        const email = studentEmailInput.value.trim().toLowerCase();
        
        if (email.endsWith(STUDENT_DOMAIN)) {
            surveyData.step2_studentEmail = email;
            sendData({ ip: surveyData.ipAddress, timestamp: new Date().toISOString(), action: 'Anna Univ Email VERIFIED', email: email });

            discountMessage.textContent = `SUCCESS! ${DISCOUNT_PERCENTAGE * 100}% discount applied for Anna University students!`;
            discountMessage.classList.remove('hidden', 'error');

            document.querySelectorAll('.redmoon-card').forEach(card => {
                const priceElement = card.querySelector('.price');
                if (priceElement.querySelector('.new-price')) {
                    return;
                }
                const fullPrice = parseFloat(card.getAttribute('data-full-price'));
                const discountedPrice = (fullPrice * (1 - DISCOUNT_PERCENTAGE)).toFixed(2);
                
                priceElement.innerHTML = `<span class="slashed-old">$${fullPrice.toFixed(2)}</span><span class="new-price">$${discountedPrice}</span>`;
            });

        } else {
            discountMessage.textContent = 'This email is not eligible for the student discount.';
            discountMessage.classList.remove('hidden');
            discountMessage.classList.add('error');
            
            document.querySelectorAll('.redmoon-card').forEach(card => {
                const priceElement = card.querySelector('.price');
                if (priceElement.querySelector('.new-price')) {
                     const fullPrice = parseFloat(card.getAttribute('data-full-price'));
                     priceElement.innerHTML = `$${fullPrice.toFixed(2)}`;
                }
            });
        }
    });

    // --- STEP 3: CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contactForm');
    const formSuccessMsg = document.getElementById('formSuccess');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        surveyData.step3_name = formData.get('name');
        surveyData.step3_phone = formData.get('phone');
        surveyData.step3_email = formData.get('email');
        
        sendData(surveyData);
        
        contactForm.classList.add('hidden');
        formSuccessMsg.classList.remove('hidden');
    });
});