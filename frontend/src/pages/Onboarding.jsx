import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth, formatErr } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ChevronRight, Loader2, Info } from "lucide-react";

const TOTAL_STEPS = 8;

const goals = [
    { v: "lose_fat", l: "Lose Fat" },
    { v: "build_muscle", l: "Build Muscle" },
    { v: "strength", l: "Get Stronger" },
    { v: "improve_fitness", l: "Improve Fitness" },
    { v: "endurance", l: "Increase Endurance" },
    { v: "stay_healthy", l: "Stay Healthy" },
    { v: "mobility", l: "Mobility / Flexibility" },
    { v: "sport_event", l: "Sport / Event" },
    { v: "maintain", l: "Maintain" },
    { v: "get_toned", l: "Get Toned" },
];
const levels = [{ v: "beginner", l: "Beginner" }, { v: "intermediate", l: "Intermediate" }, { v: "advanced", l: "Advanced" }];
const locations = [{ v: "home", l: "Home" }, { v: "gym", l: "Gym" }, { v: "both", l: "Both" }];
const diets = [{ v: "veg", l: "Vegetarian" }, { v: "non_veg", l: "Non-Veg" }, { v: "vegan", l: "Vegan" }, { v: "eggetarian", l: "Eggetarian" }];
const equipmentList = ["Dumbbells", "Barbell", "Pull-up Bar", "Bench", "Resistance Bands", "Kettlebell", "Treadmill", "Cable Machine"];
const durations = [
    { v: 15, l: "15 min" },
    { v: 30, l: "30 min" },
    { v: 45, l: "45 min" },
    { v: 60, l: "60 min" },
    { v: 90, l: "90+ min" },
];
const styles = [
    "Strength", "Hypertrophy", "HIIT", "Cardio", "Functional Fitness",
    "Powerlifting", "Olympic Lifting", "Bodyweight", "Yoga", "Pilates",
];
const injuries = [
    "Knee pain", "Lower back pain", "Shoulder pain",
    "Wrist pain", "Neck pain", "Ankle pain", "None",
];
const medicalOptions = [
    { v: "none", l: "None" },
    { v: "heart", l: "Heart conditions" },
    { v: "hypertension", l: "High blood pressure" },
    { v: "diabetes", l: "Diabetes" },
    { v: "asthma", l: "Asthma" },
    { v: "prefer_not", l: "Prefer not to say" },
];

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        age: 25, gender: "male", height_cm: 175, weight_kg: 70,
        goal: "build_muscle",
        fitness_level: "beginner", workouts_per_week: 4, session_duration_min: 45,
        workout_location: "gym", equipment: [],
        workout_styles: [],
        injuries: [],
        medical_condition: "none",
        diet_preference: "veg",
    });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const toggleArr = (k, item, exclusive = null) => {
        setForm((f) => {
            const cur = f[k] || [];
            let next;
            if (cur.includes(item)) {
                next = cur.filter((x) => x !== item);
            } else if (exclusive && item === exclusive) {
                // If "None" is selected, clear other selections
                next = [item];
            } else if (exclusive && cur.includes(exclusive)) {
                // If "None" was selected and now user picks another, remove "None"
                next = [...cur.filter((x) => x !== exclusive), item];
            } else {
                next = [...cur, item];
            }
            return { ...f, [k]: next };
        });
    };

    const submit = async () => {
        setSubmitting(true);
        try {
            const { data } = await api.post("/onboarding", form);
            setUser((u) => ({ ...u, onboarded: true, profile: data.profile }));
            try { window.localStorage.setItem("gb_onboarded", "1"); } catch { /* noop */ }
            toast.success("Plan ready! Let's train.");
            navigate("/dashboard");
        } catch (e) {
            toast.error(formatErr(e));
        } finally {
            setSubmitting(false);
        }
    };

    const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    const back = () => setStep((s) => Math.max(s - 1, 0));

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
            <div className="max-w-md mx-auto md:max-w-xl">
                <div className="flex items-center gap-1 mb-8">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#FF5722]" : "bg-zinc-800"}`} />
                    ))}
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-[#FF5722] font-bold">Step {step + 1} of {TOTAL_STEPS}</span>

                {step === 0 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">About You</h1>
                        <p className="text-zinc-400 mb-6">Help us tailor your plan</p>
                        <div className="space-y-4">
                            <Row label="Age"><Input data-testid="ob-age" type="number" value={form.age} onChange={(e) => set("age", +e.target.value)} className="bg-zinc-900 border-zinc-800 h-12" /></Row>
                            <Row label="Gender">
                                <SegmentedGroup value={form.gender} onChange={(v) => set("gender", v)}
                                    options={[{ v: "male", l: "Male" }, { v: "female", l: "Female" }, { v: "other", l: "Other" }]} testid="ob-gender" />
                            </Row>
                            <Row label="Height (cm)"><Input data-testid="ob-height" type="number" value={form.height_cm} onChange={(e) => set("height_cm", +e.target.value)} className="bg-zinc-900 border-zinc-800 h-12" /></Row>
                            <Row label="Weight (kg)"><Input data-testid="ob-weight" type="number" value={form.weight_kg} onChange={(e) => set("weight_kg", +e.target.value)} className="bg-zinc-900 border-zinc-800 h-12" /></Row>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Your Goal</h1>
                        <p className="text-zinc-400 mb-6">Pick one to focus on</p>
                        <div className="grid grid-cols-2 gap-3">
                            {goals.map((g) => (
                                <button key={g.v} data-testid={`ob-goal-${g.v}`} type="button" onClick={() => set("goal", g.v)}
                                    className={`p-4 rounded-xl border text-left ${form.goal === g.v ? "border-[#FF5722] bg-zinc-900" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"}`}>
                                    <span className="brand-heading text-lg leading-tight">{g.l}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Training Setup</h1>
                        <p className="text-zinc-400 mb-6">Where, how often, and how long?</p>
                        <Row label="Experience">
                            <SegmentedGroup value={form.fitness_level} onChange={(v) => set("fitness_level", v)} options={levels} testid="ob-level" />
                        </Row>
                        <Row label="Workouts per week">
                            <div className="flex gap-2 flex-wrap">
                                {[2, 3, 4, 5, 6].map((n) => (
                                    <button key={n} data-testid={`ob-freq-${n}`} type="button" onClick={() => set("workouts_per_week", n)}
                                        className={`w-12 h-12 rounded-lg font-bold border ${form.workouts_per_week === n ? "border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722]" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </Row>
                        <Row label="How much time do you have to work out each day?">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {durations.map((d) => (
                                    <button key={d.v} data-testid={`ob-duration-${d.v}`} type="button" onClick={() => set("session_duration_min", d.v)}
                                        className={`h-12 rounded-lg font-medium text-sm border ${form.session_duration_min === d.v ? "border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722]" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                                        {d.l}
                                    </button>
                                ))}
                            </div>
                        </Row>
                        <Row label="Location">
                            <SegmentedGroup value={form.workout_location} onChange={(v) => set("workout_location", v)} options={locations} testid="ob-location" />
                        </Row>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Equipment</h1>
                        <p className="text-zinc-400 mb-6">Tap what you have access to (optional)</p>
                        <div className="grid grid-cols-2 gap-2">
                            {equipmentList.map((e) => (
                                <button key={e} data-testid={`ob-eq-${e.replace(/\s/g, "-").toLowerCase()}`} type="button"
                                    onClick={() => toggleArr("equipment", e)}
                                    className={`p-3 rounded-lg border text-sm font-medium ${form.equipment.includes(e) ? "border-[#FF5722] bg-[#FF5722]/10 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Workout Styles</h1>
                        <p className="text-zinc-400 mb-6">Which workout styles do you enjoy? (select any)</p>
                        <div className="grid grid-cols-2 gap-2">
                            {styles.map((s) => (
                                <button key={s} data-testid={`ob-style-${s.replace(/\s/g, "-").toLowerCase()}`} type="button"
                                    onClick={() => toggleArr("workout_styles", s)}
                                    className={`p-3 rounded-lg border text-sm font-medium ${form.workout_styles.includes(s) ? "border-[#FF5722] bg-[#FF5722]/10 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Injuries / Limitations</h1>
                        <p className="text-zinc-400 mb-6">Any injuries or limitations? (select any that apply)</p>
                        <div className="grid grid-cols-2 gap-2">
                            {injuries.map((s) => (
                                <button key={s} data-testid={`ob-injury-${s.replace(/\s|\//g, "-").toLowerCase()}`} type="button"
                                    onClick={() => toggleArr("injuries", s, "None")}
                                    className={`p-3 rounded-lg border text-sm font-medium ${form.injuries.includes(s) ? "border-[#FF5722] bg-[#FF5722]/10 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Medical Conditions</h1>
                        <p className="text-zinc-400 mb-6">Do you have any medical conditions that affect exercise?</p>
                        <div className="grid grid-cols-1 gap-2">
                            {medicalOptions.map((m) => (
                                <button key={m.v} data-testid={`ob-medical-${m.v}`} type="button"
                                    onClick={() => set("medical_condition", m.v)}
                                    className={`p-3 rounded-lg border text-left font-medium ${form.medical_condition === m.v ? "border-[#FF5722] bg-[#FF5722]/10 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                                    {m.l}
                                </button>
                            ))}
                        </div>
                        <div data-testid="medical-disclaimer" className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-2 text-amber-200 text-sm">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Recommendations are not medical advice. Please consult a qualified healthcare professional before starting any exercise program if you have concerns.</span>
                        </div>
                    </div>
                )}

                {step === 7 && (
                    <div className="animate-fade-in-up">
                        <h1 className="brand-heading text-4xl mt-3 mb-2">Diet Preference</h1>
                        <p className="text-zinc-400 mb-6">For your personalized meal plan</p>
                        <div className="grid grid-cols-2 gap-3">
                            {diets.map((d) => (
                                <button key={d.v} data-testid={`ob-diet-${d.v}`} type="button" onClick={() => set("diet_preference", d.v)}
                                    className={`p-4 rounded-xl border text-left ${form.diet_preference === d.v ? "border-[#FF5722] bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"}`}>
                                    <span className="brand-heading text-xl">{d.l}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-10">
                    {step > 0 && (
                        <Button data-testid="ob-back" variant="outline" onClick={back} className="flex-1 h-12 bg-transparent border-zinc-700 text-white hover:bg-zinc-900">Back</Button>
                    )}
                    {step < TOTAL_STEPS - 1 ? (
                        <Button data-testid="ob-next" onClick={next} className="flex-1 h-12 bg-[#FF5722] hover:bg-[#E64A19] font-bold uppercase">
                            Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button data-testid="ob-finish" onClick={submit} disabled={submitting}
                            className="flex-1 h-12 bg-[#FF5722] hover:bg-[#E64A19] font-bold uppercase">
                            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating plan…</> : "Generate My Plan"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

const Row = ({ label, children }) => (
    <div className="mt-4 first:mt-0">
        <Label className="text-zinc-300 text-xs uppercase tracking-wider">{label}</Label>
        <div className="mt-2">{children}</div>
    </div>
);

const SegmentedGroup = ({ value, onChange, options, testid }) => (
    <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
            <button key={o.v} data-testid={`${testid}-${o.v}`} type="button" onClick={() => onChange(o.v)}
                className={`px-4 h-12 rounded-lg font-medium border ${value === o.v ? "border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722]" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
                {o.l}
            </button>
        ))}
    </div>
);
