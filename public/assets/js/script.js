// script.js
const checkForm = document.getElementById('license-form');
const infoForm = document.getElementById('info-form');
const licenseInput = document.getElementById('license_id');
const nameInput = document.getElementById('name');
const cidInput = document.getElementById('cid');
const checkBtn = document.getElementById('check-btn');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const alreadyDiv = document.getElementById('already-submitted');
const alertPlaceholder = document.getElementById('alert-placeholder');

function showAlert(message, type = 'info') {
  alertPlaceholder.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function clearAlert() {
  alertPlaceholder.innerHTML = '';
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

checkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  alreadyDiv.style.display = 'none';
  infoForm.style.display = 'none';

  const license_id = licenseInput.value.trim();
  if (!license_id) {
    showAlert('Enter a license ID.', 'warning');
    return;
  }

  checkBtn.disabled = true;
  checkBtn.textContent = 'Checking...';

  try {
    const resp = await postJSON('/api/check_license', { license_id });

    if (!resp || resp.error) {
      showAlert(resp?.message || 'Server error', 'danger');
    } else {
      if (!resp.allowed) {
        showAlert('License is not allowed.', 'danger');
      } else if (resp.submitted) {
        alreadyDiv.style.display = 'block';
      } else {
        infoForm.style.display = 'block';
        nameInput.focus();
        showAlert('License allowed. Please enter Name and CID and submit.', 'success');
      }
    }
  } catch (err) {
    console.error(err);
    showAlert('Network or server error.', 'danger');
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = 'Check';
  }
});

// cancel - hide name/cid
cancelBtn.addEventListener('click', () => {
  infoForm.style.display = 'none';
  licenseInput.focus();
  nameInput.value = '';
  cidInput.value = '';
  clearAlert();
});

// handle info submission
infoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const license_id = licenseInput.value.trim();
  const name = nameInput.value.trim();
  const cid = cidInput.value.trim();

  if (!license_id || !name || !cid) {
    showAlert('All fields are required.', 'warning');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const resp = await postJSON('/api/submit_form', { license_id, name, cid });

    if (!resp || resp.error) {
      showAlert(resp?.message || 'Submission failed', 'danger');
    } else {
      showAlert('Submitted successfully. Thank you!', 'success');
      infoForm.style.display = 'none';
      licenseInput.value = '';
      nameInput.value = '';
      cidInput.value = '';
    }
  } catch (err) {
    console.error(err);
    showAlert('Network or server error.', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});
