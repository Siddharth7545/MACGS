import React, { useState } from "react";
import { User } from "../types";
import { UserCheck, Sparkles, Plus, X, ListTodo, GraduationCap, Award, Briefcase } from "lucide-react";

interface ProfilePageProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
  onTriggerReanalysis?: () => void;
}

export default function ProfilePage({ user, onProfileUpdate, onTriggerReanalysis }: ProfilePageProps) {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

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
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Add handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleAddExp = () => {
    if (newExp.trim()) {
      setExperience([...experience, newExp.trim()]);
      setNewExp("");
    }
  };

  const handleAddEdu = () => {
    if (newEdu.trim()) {
      setEducation([...education, newEdu.trim()]);
      setNewEdu("");
    }
  };

  const handleAddCert = () => {
    if (newCert.trim()) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert("");
    }
  };

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
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-750 uppercase tracking-widest mb-1.5">
                Current Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science Student"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-750 uppercase tracking-widest mb-1.5">
                Target Profession / Goal
              </label>
              <input
                type="text"
                placeholder="e.g. AI Integrator / Web Architect"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
              />
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
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
                onChange={(e) => setNewEdu(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddEdu}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Insert Row
              </button>
            </div>
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
                onChange={(e) => setNewExp(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddExp}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Insert Row
              </button>
            </div>
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
                onChange={(e) => setNewCert(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Insert Row
              </button>
            </div>
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
