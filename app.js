// ============================================
// نظام استبيان جامعة صنعاء - app.js
// ============================================

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize theme toggle
    initThemeToggle();
    
    const form = document.getElementById("surveyForm");
    
    // التحقق إذا كان المستخدم قد ملأ الاستبيان مسبقاً
    if (localStorage.getItem('surveySubmitted')) {
        document.getElementById('surveyForm').innerHTML = `
            <div class="thank-you-box" style="text-align:center; padding:50px; background:white; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#2c3e50;">شكراً لك! 🎉</h2>
                <p>لقد قمت بتعبئة هذا الاستبيان مسبقاً.</p>
            </div>
        `;
    }
    
    // التحقق من الموافقة
    const consentRadios = document.querySelectorAll('input[name="consent"]');
    consentRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'لا') {
                alert('يجب الموافقة للمتابعة');
                if (form) form.style.display = 'none';
            } else {
                if (form) form.style.display = 'block';
            }
        });
    });
    
    // إضافة حدث لإظهار/إخفاء حقول الأجهزة الأخرى
    const otherDevicesRadios = document.querySelectorAll('input[name="otherDevicesUse"]');
    otherDevicesRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const otherDevicesTypeGroup = document.getElementById('otherDevicesTypeGroup');
            const otherDevicesDurationGroup = document.getElementById('otherDevicesDurationGroup');
            const otherDevicesDurationSingleGroup = document.getElementById('otherDevicesDurationSingleGroup');
            const otherDevicesDurationDailyGroup = document.getElementById('otherDevicesDurationDailyGroup');
            
            if (this.value === 'نعم') {
                if (otherDevicesTypeGroup) otherDevicesTypeGroup.style.display = 'block';
                if (otherDevicesDurationGroup) otherDevicesDurationGroup.style.display = 'block';
                if (otherDevicesDurationSingleGroup) otherDevicesDurationSingleGroup.style.display = 'block';
                if (otherDevicesDurationDailyGroup) otherDevicesDurationDailyGroup.style.display = 'block';
            } else {
                if (otherDevicesTypeGroup) otherDevicesTypeGroup.style.display = 'none';
                if (otherDevicesDurationGroup) otherDevicesDurationGroup.style.display = 'none';
                if (otherDevicesDurationSingleGroup) otherDevicesDurationSingleGroup.style.display = 'none';
                if (otherDevicesDurationDailyGroup) otherDevicesDurationDailyGroup.style.display = 'none';
                // مسح القيم عند الإخفاء
                document.querySelectorAll('input[name="otherDevicesType"]').forEach(cb => cb.checked = false);
                const durationTotalInput = document.querySelector('input[name="otherDevicesDurationTotal"]');
                const durationSingleInput = document.querySelector('input[name="otherDevicesDurationSingle"]');
                const durationDailyInput = document.querySelector('input[name="otherDevicesDurationDaily"]');
                if (durationTotalInput) durationTotalInput.value = '';
                if (durationSingleInput) durationSingleInput.value = '';
                if (durationDailyInput) durationDailyInput.value = '';
            }
        });
    });
    
    if (form) {
        form.addEventListener("submit", handleSurveySubmit);
    }
});

async function handleSurveySubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = collectFormData();
    try {
        const response = await fetch("/survey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            localStorage.setItem('surveySubmitted', 'true');
            document.getElementById('surveyForm').style.display = 'none';
            document.getElementById('thankYouSection').style.display = 'block';
        } else {
            alert("❌ حدث خطأ في السيرفر، يرجى المحاولة لاحقاً.");
        }
    } catch (err) {
        console.error(err);
        alert("❌ حدث خطأ أثناء الإرسال، يرجى التأكد من اتصال الإنترنت.");
    }
}

function validateForm() {
    const consent = document.querySelector('input[name="consent"]:checked');
    if (!consent || consent.value === 'لا') {
        alert('يجب الموافقة على المشاركة');
        return false;
    }
    return true;
}

function collectFormData() {
    const data = {
        id: 'survey_' + Date.now(),
        timestamp: new Date().toISOString()
    };
    const formElements = document.getElementById("surveyForm").elements;
    
    // تجميع القيم من كافة عناصر النموذج
    for (let element of formElements) {
        if (!element.name) continue;
        if (element.type === "radio") {
            if (element.checked) data[element.name] = element.value;
        } else if (element.type === "checkbox") {
            if (element.checked) {
                if (!data[element.name]) {
                    data[element.name] = element.value;
                } else {
                    data[element.name] += ", " + element.value;
                }
            }
        } else {
            data[element.name] = element.value;
        }
    }
    return data;
}
