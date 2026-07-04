import React, { useState } from "react";
import { User } from "../types";
import { UserCheck, Sparkles, Plus, X, ListTodo, GraduationCap, Award, Briefcase } from "lucide-react";

interface ProfilePageProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
  onTriggerReanalysis?: () => void;
  onNavigateToNext?: () => void;
}

export default function ProfilePage({ user, onProfileUpdate, onTriggerReanalysis, onNavigateToNext }: ProfilePageProps) {
  // Local state
  const [name, setName] = useState(user.name);
  const [currentRole, setCurrentRole] = useState(user.profile?.currentRole || "");
  const [targetRole, setTargetRole] = useState(user.profile?.targetRole || "");
  const [skills, setSkills] = useState<string[]>(user.profile?.skills || []);
  const [interests, setInterests] = useState<string[]>(user.profile?.interests || []);
  const [experience, setExperience] = useState<string[]>(user.profile?.experience || []);
  const [education, setEducation] = useState<string[]>(user.profile?.education || []);
  const [certifications, setCertifications] = useState<string[]>(user.profile?.certifications || []);

  // New item inputs
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newExp, setNewExp] = useState("");
  const [newEdu, setNewEdu] = useState("");
  const [newCert, setNewCert] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inputError, setInputError] = useState<{ field: string, message: string } | null>(null);

  const isValidEntry = (text: string) => {
    const t = text.trim();
    if (t.length < 2) return false;
    if (!/[a-zA-Z]/.test(t)) return false; // Must contain at least one letter
    if (/(.)\1{3,}/.test(t)) return false; // No repeated chars like aaaa
    if (/^(asdf|qwer|zxcv|test|dummy|abcd|xyz|none|n\/a|na|null|undefined|nothing|idk|unknown)/i.test(t)) return false;
    // Common keyboard smashes
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(t)) return false;
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setInputError(null);

    if (!isValidEntry(name)) {
      setErrorMsg("Please enter a valid, meaningful Name. Meaningless inputs confuse the AI.");
      setInputError({ field: "Name", message: "Invalid Name" });
      setLoading(false);
      return;
    }
    if (currentRole && !isValidEntry(currentRole)) {
      setErrorMsg("Please enter a valid, meaningful Current Role. Meaningless inputs confuse the AI.");
      setInputError({ field: "CurrentRole", message: "Invalid Current Role" });
      setLoading(false);
      return;
    }
    if (targetRole && !isValidEntry(targetRole)) {
      setErrorMsg("Please enter a valid, meaningful Target Role. Meaningless inputs confuse the AI.");
      setInputError({ field: "TargetRole", message: "Invalid Target Role" });
      setLoading(false);
      return;
    }

    // Validate all items in the lists to be absolutely sure
    const allListEntries = [
      ...skills.map(s => ({ type: "Skill", val: s })),
      ...interests.map(s => ({ type: "Interest", val: s })),
      ...experience.map(s => ({ type: "Experience", val: s })),
      ...education.map(s => ({ type: "Education", val: s })),
      ...certifications.map(s => ({ type: "Certification", val: s }))
    ];

    for (const entry of allListEntries) {
      if (!isValidEntry(entry.val)) {
        setErrorMsg(`Found an invalid entry in ${entry.type}s: "${entry.val}". Please remove meaningless entries before saving.`);
        setLoading(false);
        return;
      }
    }

    if (skills.length === 0 && experience.length === 0 && education.length === 0) {
      setErrorMsg("Please add at least some skills, experience, or education for the AI to analyze.");
      setLoading(false);
      return;
    }

    // Check for pending unsaved valid/invalid input in add fields
    if (newSkill.trim() && !isValidEntry(newSkill)) {
      setErrorMsg("Unsaved invalid Skill. Please clear it or enter a meaningful value.");
      setInputError({ field: "Skill", message: "Invalid input" });
      setLoading(false); return;
    }
    if (newInterest.trim() && !isValidEntry(newInterest)) {
      setErrorMsg("Unsaved invalid Interest. Please clear it or enter a meaningful value.");
      setInputError({ field: "Interest", message: "Invalid input" });
      setLoading(false); return;
    }
    if (newExp.trim() && !isValidEntry(newExp)) {
      setErrorMsg("Unsaved invalid Experience. Please clear it or enter a meaningful value.");
      setInputError({ field: "Experience", message: "Invalid input" });
      setLoading(false); return;
    }
    if (newEdu.trim() && !isValidEntry(newEdu)) {
      setErrorMsg("Unsaved invalid Education. Please clear it or enter a meaningful value.");
      setInputError({ field: "Education", message: "Invalid input" });
      setLoading(false); return;
    }
    if (newCert.trim() && !isValidEntry(newCert)) {
      setErrorMsg("Unsaved invalid Certification. Please clear it or enter a meaningful value.");
      setInputError({ field: "Certification", message: "Invalid input" });
      setLoading(false); return;
    }

    const payload = {
      name,
      currentRole,
      targetRole,
      skills,
      interests,
      experience,
      education,
      certifications,
    };

    try {
      const res = await fetch(`/api/profile/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to preserve profile data on server");
      }

      const data = await res.json();
      onProfileUpdate({
        ...user,
        name: data.name,
        profile: data.profile,
      });
      setSuccessMsg("Profile synced securely on our cloud node!");
      setTimeout(() => {
        setSuccessMsg("");
        if (onNavigateToNext) {
          onNavigateToNext();
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Add handlers
  const validateAndAdd = (
    val: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setVal: React.Dispatch<React.SetStateAction<string>>,
    fieldName: string
  ) => {
    setErrorMsg("");
    setInputError(null);
    if (!val.trim()) return;
    if (!isValidEntry(val)) {
      setErrorMsg(`Please enter a valid, meaningful ${fieldName.toLowerCase()}. Meaningless inputs confuse the AI.`);
      setInputError({ field: fieldName, message: `Invalid ${fieldName}` });
      return;
    }
    if (!list.includes(val.trim())) {
      setList([...list, val.trim()]);
      setVal("");
    }
  };

  const handleAddSkill = () => validateAndAdd(newSkill, skills, setSkills, setNewSkill, "Skill");
  const handleAddInterest = () => validateAndAdd(newInterest, interests, setInterests, setNewInterest, "Interest");
  const handleAddExp = () => validateAndAdd(newExp, experience, setExperience, setNewExp, "Experience");
  const handleAddEdu = () => validateAndAdd(newEdu, education, setEducation, setNewEdu, "Education");
  const handleAddCert = () => validateAndAdd(newCert, certifications, setCertifications, setNewCert, "Certification");

  // Delete handlers
  const handleDelSkill = (val: string) => setSkills(skills.filter((s) => s !== val));
  const handleDelInterest = (val: string) => setInterests(interests.filter((i) => i !== val));
  const handleDelExp = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));
  const handleDelEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const handleDelCert = (idx: number) => setCertifications(certifications.filter((_, i) => i !== idx));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">User Career Portfolio</h1>
          <p className="text-xs text-gray-500">
            Define your qualifications. The User Profile Agent (A-001) coordinates this schema against market requirements.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold">
          <UserCheck className="w-4 h-4 text-teal-600" /> A-001 Sync Active
        </span>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-xl">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 text-xs font-medium rounded-xl">
          {errorMsg}
        </div>
      )}

      {onTriggerReanalysis && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-indigo-900/55 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Dynamic Career Archetype Calibration
            </h3>
            <p className="text-[11px] text-slate-350 leading-relaxed max-w-xl font-sans">
              Need to re-route your track? Re-select your status (Academic Student, Graduate, Career Changer, or Job Seeker) and let our 8 autonomous system components re-calibrate your active target profiles.
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerReanalysis}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs rounded-xl transition-colors shrink-0 shadow-md cursor-pointer font-sans"
          >
            Launch Profile Analyzer
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Profile Attributes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Core Attributes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-750 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (inputError?.field === "Name") setInputError(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg text-xs ${inputError?.field === "Name" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
                required
              />
              {inputError?.field === "Name" && <p className="text-[10px] text-rose-600 font-semibold mt-1">{inputError.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-750 uppercase tracking-widest mb-1.5">
                Current Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science Student"
                value={currentRole}
                onChange={(e) => {
                  setCurrentRole(e.target.value);
                  if (inputError?.field === "CurrentRole") setInputError(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg text-xs ${inputError?.field === "CurrentRole" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
              />
              {inputError?.field === "CurrentRole" && <p className="text-[10px] text-rose-600 font-semibold mt-1">{inputError.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-750 uppercase tracking-widest mb-1.5">
                Target Profession / Goal
              </label>
              <input
                type="text"
                placeholder="e.g. AI Integrator / Web Architect"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  if (inputError?.field === "TargetRole") setInputError(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-amber-500 ${inputError?.field === "TargetRole" ? "border-rose-500 bg-rose-50" : "border-blue-200"}`}
              />
              {inputError?.field === "TargetRole" && <p className="text-[10px] text-rose-600 font-semibold mt-1">{inputError.message}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Skill Tags & Interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Skill Blocks */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-teal-600" /> Competencies & Skills
            </h3>
            <p className="text-[11px] text-gray-400">
              Input languages, frameworks, packages, or soft skills you command.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React 19, TypeScript"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  if (inputError?.field === "Skill") setInputError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-xs focus:outline-none ${inputError?.field === "Skill" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {inputError?.field === "Skill" && <p className="text-[10px] text-rose-600 font-semibold">{inputError.message}</p>}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No skill tags registered yet.</span>
              ) : (
                skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-teal-50 border border-teal-150 text-teal-800 rounded-full"
                  >
                    {s}
                    <button type="button" onClick={() => handleDelSkill(s)}>
                      <X className="w-3 h-3 text-teal-600 hover:text-teal-900 cursor-pointer" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Interests Blocks */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-600" /> Specialized Interests
            </h3>
            <p className="text-[11px] text-gray-400">
              Fields you aspire to explore (e.g. RAG Pipelines, System Design).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Automation, Web Design"
                value={newInterest}
                onChange={(e) => {
                  setNewInterest(e.target.value);
                  if (inputError?.field === "Interest") setInputError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-xs focus:outline-none ${inputError?.field === "Interest" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {inputError?.field === "Interest" && <p className="text-[10px] text-rose-600 font-semibold">{inputError.message}</p>}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {interests.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No interests listed.</span>
              ) : (
                interests.map((i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-violet-50 border border-violet-150 text-violet-800 rounded-full"
                  >
                    {i}
                    <button type="button" onClick={() => handleDelInterest(i)}>
                      <X className="w-3 h-3 text-violet-600 hover:text-violet-900 cursor-pointer" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Academic Profile, Certifications, Experiential Details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          {/* Academia */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-4 h-4 text-amber-500" /> Academic & Degrees
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. B.E. Computer Science, XII Standard"
                value={newEdu}
                onChange={(e) => {
                  setNewEdu(e.target.value);
                  if (inputError?.field === "Education") setInputError(null);
                }}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-xs ${inputError?.field === "Education" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={handleAddEdu}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Insert Row
              </button>
            </div>
            {inputError?.field === "Education" && <p className="text-[10px] text-rose-600 font-semibold">{inputError.message}</p>}
            <ul className="divide-y divide-gray-100 text-xs">
              {education.map((edu, index) => (
                <li key={index} className="py-2 flex items-center justify-between">
                  <span>{edu}</span>
                  <button type="button" onClick={() => handleDelEdu(index)} className="text-rose-600 hover:text-rose-800">
                    <X className="w-4 h-4 cursor-pointer" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Briefcase className="w-4 h-4 text-emerald-600" /> Professional/Project Experience
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Created a mini full-stack e-commerce demo"
                value={newExp}
                onChange={(e) => {
                  setNewExp(e.target.value);
                  if (inputError?.field === "Experience") setInputError(null);
                }}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-xs ${inputError?.field === "Experience" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={handleAddExp}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Insert Row
              </button>
            </div>
            {inputError?.field === "Experience" && <p className="text-[10px] text-rose-600 font-semibold">{inputError.message}</p>}
            <ul className="divide-y divide-gray-100 text-xs">
              {experience.map((exp, index) => (
                <li key={index} className="py-2 flex items-center justify-between">
                  <span>{exp}</span>
                  <button type="button" onClick={() => handleDelExp(index)} className="text-rose-600 hover:text-rose-800">
                    <X className="w-4 h-4 cursor-pointer" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-blue-600" /> Industry Certifications
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Certified Cloud Developer Associate"
                value={newCert}
                onChange={(e) => {
                  setNewCert(e.target.value);
                  if (inputError?.field === "Certification") setInputError(null);
                }}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-xs ${inputError?.field === "Certification" ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Insert Row
              </button>
            </div>
            {inputError?.field === "Certification" && <p className="text-[10px] text-rose-600 font-semibold">{inputError.message}</p>}
            <ul className="divide-y divide-gray-100 text-xs">
              {certifications.map((cert, index) => (
                <li key={index} className="py-2 flex items-center justify-between">
                  <span>{cert}</span>
                  <button type="button" onClick={() => handleDelCert(index)} className="text-rose-600 hover:text-rose-800">
                    <X className="w-4 h-4 cursor-pointer" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-white shadow-sm rounded-xl text-xs sm:text-sm cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? "Saving to Cloud Record..." : "Sync Portfolio on Server"}
          </button>
        </div>
      </form>
    </div>
  );
}
