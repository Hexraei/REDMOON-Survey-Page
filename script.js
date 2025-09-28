document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyh5hy-CuaafLA7dx1taTuAALAplYhOzAl3RHAMs8r5l7tRgyIMnamWWOHSTzCwXA5amg/exec';
    const STUDENT_DOMAIN = '@student.annauniv.edu';
    const DISCOUNT_PERCENTAGE = 0.7; // 70% discount

    // --- STATE MANAGEMENT ---
    const surveyData = {
        timestamp: null, ip: 'Fetching...', step1_choice: null, step2_studentEmail: null,
        step3_name: null, step3_phone: null, step3_email: null,
    };

    // --- HELPER FUNCTION ---
    const sendData = (data) => {
        data.timestamp = new Date().toISOString();
        fetch(SCRIPT_URL, {
            method: 'POST',
            // mode: 'no-cors', // <-- REMOVED FOR BETTER DEBUGGING
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data); 
        })
        .catch(err => console.error('Error sending final data:', err));
    };

    // --- GET USER IP ---
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => { surveyData.ip = data.ip; })
        .catch(() => { surveyData.ip = 'Not Found'; });

    // --- STEP 1: T-SHIRT SELECTION ---
    const tshirtCards = document.querySelectorAll('.tshirt-card');
    const continueBtn = document.getElementById('continueBtn');
    
    tshirtCards.forEach(card => {
        card.addEventListener('click', () => {
            tshirtCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            surveyData.step1_choice = card.getAttribute('data-choice');
            continueBtn.disabled = false;
        });
    });

    continueBtn.addEventListener('click', () => {
        const step1Section = document.getElementById('step1');
        const step2Section = document.getElementById('step2');
        const step3Section = document.getElementById('step3');
        step1Section.classList.add('hidden');
        step2Section.classList.remove('hidden');
        step3Section.classList.remove('hidden');
        step2Section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // --- STEP 2: EMAIL VERIFICATION ---
    const studentEmailInput = document.getElementById('studentEmail');
    const verifyBtn = document.getElementById('verifyEmailBtn');
    const discountMessage = document.getElementById('discountMessage');

    verifyBtn.addEventListener('click', () => {
        const email = studentEmailInput.value.trim().toLowerCase();
        
        if (email.endsWith(STUDENT_DOMAIN)) {
            surveyData.step2_studentEmail = email;
            discountMessage.textContent = `SUCCESS! 70% discount applied.`;
            discountMessage.classList.remove('hidden', 'error');

            document.querySelectorAll('.redmoon-card').forEach(card => {
                const priceElement = card.querySelector('.price');
                if (priceElement.querySelector('.new-price')) { return; } 
                
                const fullPriceUsd = parseFloat(card.getAttribute('data-full-price'));
                const fullPriceInr = parseFloat(card.getAttribute('data-inr-price'));
                const discountedUsd = (fullPriceUsd * (1 - DISCOUNT_PERCENTAGE)).toFixed(2);
                const discountedInr = Math.round(fullPriceInr * (1 - DISCOUNT_PERCENTAGE));

                priceElement.innerHTML = `
                    <span class="slashed-old">
                        $${fullPriceUsd.toFixed(2)}
                        <span class="inr-price">₹${fullPriceInr.toLocaleString('en-IN')}</span>
                    </span>
                    <span class="usd-price new-price">$${discountedUsd}</span>
                    <span class="inr-price new-price">₹${discountedInr.toLocaleString('en-IN')}</span>
                `;
            });
        } else {
            surveyData.step2_studentEmail = null;
            discountMessage.textContent = 'This email is not eligible for the student discount.';
            discountMessage.classList.remove('hidden');
            discountMessage.classList.add('error');
            
            document.querySelectorAll('.redmoon-card').forEach(card => {
                const priceElement = card.querySelector('.price');
                if (priceElement.querySelector('.new-price')) {
                    const fullPriceUsd = parseFloat(card.getAttribute('data-full-price')).toFixed(2);
                    const fullPriceInr = parseFloat(card.getAttribute('data-inr-price'));
                    priceElement.innerHTML = `
                        <span class="usd-price">$${fullPriceUsd}</span>
                        <span class="inr-price">₹${fullPriceInr.toLocaleString('en-IN')}</span>
                    `;
                }
            });
        }
    });

    // --- STEP 3: FINAL FORM SUBMISSION ---
    const contactForm = document.getElementById('contactForm');
    const formSuccessMsg = document.getElementById('formSuccess');
    // NEW: Get the h2 heading for step 3
    const step3Header = document.querySelector('#step3 h2');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        surveyData.step3_name = formData.get('name');
        surveyData.step3_phone = formData.get('phone');
        surveyData.step3_email = formData.get('email');
        sendData(surveyData);
        
        // HIDE ALL ELEMENTS EXCEPT THE SUCCESS MESSAGE
        contactForm.classList.add('hidden');
        step3Header.classList.add('hidden'); // ADDED THIS LINE
        
        formSuccessMsg.classList.remove('hidden');
    });
});
