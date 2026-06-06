const form = document.querySelector("#healthForm");
const resetButton = document.querySelector("#resetButton");

const outputs = {
  overallScore: document.querySelector("#overallScore"),
  overallText: document.querySelector("#overallText"),
  bmiValue: document.querySelector("#bmiValue"),
  bmiLabel: document.querySelector("#bmiLabel"),
  calorieValue: document.querySelector("#calorieValue"),
  waistValue: document.querySelector("#waistValue"),
  waistLabel: document.querySelector("#waistLabel"),
  waterValue: document.querySelector("#waterValue"),
  waterLabel: document.querySelector("#waterLabel"),
  insightsList: document.querySelector("#insightsList"),
};

const defaultValues = {
  age: 21,
  sex: "female",
  feet: 5,
  inches: 8,
  weight: 150,
  waist: 32,
  activity: "1.55",
  sleep: 7,
  water: 70,
};

function getNumber(id) {
  return Number(document.querySelector(`#${id}`).value);
}

function getFormData() {
  const feet = getNumber("feet");
  const inches = getNumber("inches");

  return {
    age: getNumber("age"),
    sex: document.querySelector("#sex").value,
    heightInches: feet * 12 + inches,
    weightPounds: getNumber("weight"),
    waistInches: getNumber("waist"),
    activityFactor: Number(document.querySelector("#activity").value),
    sleepHours: getNumber("sleep"),
    waterOunces: getNumber("water"),
  };
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight range", score: 14, tone: "watch" };
  if (bmi < 25) return { label: "Healthy range", score: 25, tone: "good" };
  if (bmi < 30) return { label: "Overweight range", score: 17, tone: "watch" };
  return { label: "Obesity range", score: 9, tone: "risk" };
}

function getWaistStatus(ratio) {
  if (ratio < 0.5) return { label: "Lower risk range", score: 25, tone: "good" };
  if (ratio < 0.6) return { label: "Worth watching", score: 15, tone: "watch" };
  return { label: "Higher risk range", score: 8, tone: "risk" };
}

function getSleepScore(hours) {
  if (hours >= 7 && hours <= 9) return 25;
  if (hours >= 6 && hours < 10) return 17;
  return 8;
}

function getWaterScore(actual, goal) {
  const percent = actual / goal;
  if (percent >= 0.9 && percent <= 1.5) return 25;
  if (percent >= 0.7) return 16;
  return 8;
}

function setTone(element, tone) {
  element.classList.remove("good", "watch", "risk");
  element.classList.add(tone);
}

function calculateHealth(data) {
  const heightMeters = data.heightInches * 0.0254;
  const weightKg = data.weightPounds * 0.453592;
  const heightCm = data.heightInches * 2.54;
  const bmi = weightKg / heightMeters ** 2;
  const bmiStatus = getBmiCategory(bmi);
  const waistRatio = data.waistInches / data.heightInches;
  const waistStatus = getWaistStatus(waistRatio);
  const bmrOffset = data.sex === "male" ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + bmrOffset;
  const calories = bmr * data.activityFactor;
  const waterGoal = Math.round(data.weightPounds * 0.5);
  const sleepScore = getSleepScore(data.sleepHours);
  const waterScore = getWaterScore(data.waterOunces, waterGoal);
  const score = Math.round(bmiStatus.score + waistStatus.score + sleepScore + waterScore);

  return {
    bmi,
    bmiStatus,
    waistRatio,
    waistStatus,
    calories,
    waterGoal,
    score,
  };
}

function buildInsights(data, result) {
  const insights = [];

  insights.push(`Your estimated maintenance intake is about ${Math.round(result.calories).toLocaleString()} calories per day based on your activity level.`);

  if (result.bmiStatus.tone === "good") {
    insights.push("Your BMI is in the commonly used healthy range. Keep focusing on energy, strength, sleep, and consistency.");
  } else {
    insights.push("Your BMI is outside the commonly used healthy range. BMI is imperfect, so use it as a conversation starter, not a final verdict.");
  }

  if (result.waistStatus.tone === "good") {
    insights.push("Your waist-to-height ratio is in a lower-risk range.");
  } else {
    insights.push("Your waist-to-height ratio is worth watching. Many wellness programs use a goal below 0.5 as a simple marker.");
  }

  if (data.sleepHours >= 7 && data.sleepHours <= 9) {
    insights.push("Your sleep duration is in the typical recommended range for adults.");
  } else {
    insights.push("Your sleep is outside the 7-9 hour range often recommended for adults. A steady bedtime is a useful first experiment.");
  }

  if (data.waterOunces >= result.waterGoal) {
    insights.push("You reached the simple hydration estimate for today.");
  } else {
    insights.push(`Try adding about ${result.waterGoal - data.waterOunces} more ounces of water to reach today's estimate.`);
  }

  return insights;
}

function renderResults(data, result) {
  outputs.overallScore.textContent = `${result.score}/100`;

  if (result.score >= 80) {
    outputs.overallText.textContent = "Strong overall wellness signals.";
    setTone(outputs.overallScore, "good");
  } else if (result.score >= 55) {
    outputs.overallText.textContent = "Good start, with a few habits to improve.";
    setTone(outputs.overallScore, "watch");
  } else {
    outputs.overallText.textContent = "Several areas could use attention.";
    setTone(outputs.overallScore, "risk");
  }

  outputs.bmiValue.textContent = result.bmi.toFixed(1);
  outputs.bmiLabel.textContent = result.bmiStatus.label;
  setTone(outputs.bmiValue, result.bmiStatus.tone);

  outputs.calorieValue.textContent = Math.round(result.calories).toLocaleString();
  outputs.waistValue.textContent = result.waistRatio.toFixed(2);
  outputs.waistLabel.textContent = result.waistStatus.label;
  setTone(outputs.waistValue, result.waistStatus.tone);

  outputs.waterValue.textContent = `${result.waterGoal} oz`;
  outputs.waterLabel.textContent = `${Math.round((data.waterOunces / result.waterGoal) * 100)}% reached today`;
  setTone(outputs.waterValue, data.waterOunces >= result.waterGoal ? "good" : "watch");

  outputs.insightsList.innerHTML = buildInsights(data, result)
    .map((insight) => `<li>${insight}</li>`)
    .join("");
}

function analyze(event) {
  event.preventDefault();
  const data = getFormData();
  const result = calculateHealth(data);
  renderResults(data, result);
}

function resetForm() {
  Object.entries(defaultValues).forEach(([id, value]) => {
    document.querySelector(`#${id}`).value = value;
  });

  form.dispatchEvent(new Event("submit"));
}

form.addEventListener("submit", analyze);
resetButton.addEventListener("click", resetForm);
form.dispatchEvent(new Event("submit"));
