/* join.js — Member Registration Page JS */

const API = 'http://localhost:5000/api';

let selectedPlan = 'Basic';
let selectedPrice = 999;

// ── Plan Selector ─────────────────────────────────
document.querySelectorAll('.plan-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.plan-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedPlan  = opt.dataset.plan;
    selectedPrice = opt.dataset.price;
    updatePlanDisplay();
  });
});

function updatePlanDisplay() {
  const durations = { Basic: '1 month', Standard: '3 months', Premium: '1 year' };
  const prices    = { Basic: '₹999', Standard: '₹2,499', Premium: '₹5,999' };
  document.getElementById('selectedPlanDisplay').textContent =
    `${selectedPlan} – ${prices[selectedPlan]} / ${durations[selectedPlan]}`;
}

// ── Pre-select from URL param ─────────────────────
const urlPlan = new URLSearchParams(window.location.search).get('plan');
if (urlPlan) {
  const opt = document.querySelector(`.plan-option[data-plan="${urlPlan}"]`);
  if (opt) {
    document.querySelectorAll('.plan-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedPlan  = opt.dataset.plan;
    selectedPrice = opt.dataset.price;
  }
}
updatePlanDisplay();

// ── Step Navigation ───────────────────────────────
document.getElementById('nextStep').addEventListener('click', () => {
  const name   = document.getElementById('jName').value.trim();
  const phone  = document.getElementById('jPhone').value.trim();
  const email  = document.getElementById('jEmail').value.trim();
  const age    = document.getElementById('jAge').value;
  const gender = document.getElementById('jGender').value;

  if (!name || !phone || !email || !age || !gender) {
    alert('Please fill all required fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  document.getElementById('formStep1').style.display = 'none';
  document.getElementById('formStep2').style.display = 'block';
  document.getElementById('step1').classList.remove('active');
  document.getElementById('step1').classList.add('done');
  document.getElementById('step2').classList.add('active');
  document.getElementById('line1').classList.add('done');
});

document.getElementById('prevStep').addEventListener('click', () => {
  document.getElementById('formStep2').style.display = 'none';
  document.getElementById('formStep1').style.display = 'block';
  document.getElementById('step2').classList.remove('active');
  document.getElementById('step1').classList.remove('done');
  document.getElementById('step1').classList.add('active');
  document.getElementById('line1').classList.remove('done');
});

// ── Submit Registration ───────────────────────────
document.getElementById('submitJoin').addEventListener('click', async () => {
  const btn = document.getElementById('submitJoin');
  const errEl = document.getElementById('joinError');

  const payload = {
    name:           document.getElementById('jName').value.trim(),
    email:          document.getElementById('jEmail').value.trim(),
    phone:          document.getElementById('jPhone').value.trim(),
    age:            parseInt(document.getElementById('jAge').value),
    gender:         document.getElementById('jGender').value,
    address:        document.getElementById('jAddress').value.trim(),
    membershipPlan: selectedPlan,
    fitnessGoal:    document.getElementById('jGoal').value,
    paymentMode:    document.getElementById('jPayment').value
  };

  btn.disabled = true;
  btn.textContent = 'Registering…';
  errEl.style.display = 'none';

  try {
    const res  = await fetch(`${API}/members/public/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Registration failed');

    // Show success
    document.getElementById('formStep2').style.display = 'none';
    const successScreen = document.getElementById('successScreen');
    successScreen.classList.add('show');
    document.getElementById('newMemberId').textContent = `#SF${data.data._id.slice(-6).toUpperCase()}`;

  } catch (err) {
    errEl.textContent = `❌ ${err.message}`;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '🎉 Complete Registration';
  }
});
