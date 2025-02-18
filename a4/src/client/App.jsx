import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const App = () => {
    const [username, setUsername] = useState("");
    const [piggies, setPiggies] = useState([]);
    const [form, setForm] = useState({ title: "", amount: "", need: "Low" });
    const [editingPiggy, setEditingPiggy] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserInfo();
        loadPiggyBanks();
    }, []);

    const fetchUserInfo = async () => {
        const res = await fetch("/user-info");
        const data = await res.json();
        if (data.username) {
            setUsername(data.username);
        } else {
            navigate("/login");
        }
    };

    const loadPiggyBanks = async () => {
        const res = await fetch("/piggies");
        const piggiesData = await res.json();
        setPiggies(piggiesData);
    };

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return;

        const res = await fetch("/add-piggy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, username }),
        });

        const data = await res.json();
        if (data.success) {
            setForm({ title: "", amount: "", goal: "", need: "Low"});
            loadPiggyBanks();
        } else {
            alert(data.message);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return;

        await fetch(`/edit-piggy/${editingPiggy._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setEditingPiggy(null);
        setForm({ title: "", amount: "", need: "Low" });
        loadPiggyBanks();
    };

    const deletePiggyBank = async (id) => {
        await fetch(`/delete-piggy/${id}`, { method: "DELETE" });
        loadPiggyBanks();
    };

    const ProgressBar = ({ value, max }) => {
        const percentage = (value / max) * 100;
        const dashArray = `${percentage} 100`;

        const progressColor =
            percentage < 50 ? "text-red-500" :
                percentage < 75 ? "text-yellow-500" :
                    "text-green-500";

        return (
            <div className="relative size-40">
                <svg className="rotate-[135deg] size-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200" strokeWidth="2" strokeDasharray="100 100" strokeLinecap="round"></circle>
                    <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${progressColor}`} strokeWidth="2" strokeDasharray={dashArray} strokeLinecap="round"></circle>
                </svg>
                <div className="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className={`text-xl font-bold ${progressColor}`}>{value}</span>
                    <span className={`${progressColor} block`}>/ {max}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-blue-100 flex flex-col min-h-screen">
            <nav className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center">
                <img src="/piggy_bank.png" alt="Piggy bank" className="w-16 h-12 object-cover" />
                <h1 className="text-lg font-bold text-gray-700">User: <span className="text-blue-500">{username}</span></h1>
                <a href="/logout" className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md">Logout</a>
            </nav>
            <h1 className="text-3xl font-extrabold text-center text-gray-700 mt-8 mb-8">Piggy Savings</h1>
            <div className="p-4 w-full max-w-6xl mx-auto">
                {editingPiggy ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-sm mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-4">Edit Piggy</h2>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 w-full">
                            <input type="text" id="title" className="p-3 border rounded-lg text-base" placeholder="Title" value={form.title} onChange={handleInputChange} required/>
                            <input type="number" id="amount" className="p-3 border rounded-lg text-base" placeholder="Amount" value={form.amount} onChange={handleInputChange} required/>
                            <input type="number" id="goal" className="p-3 border rounded-lg text-base" placeholder="Goal" value={form.goal} onChange={handleInputChange} required/>
                            <label className="text-sm font-semibold text-gray-700 flex items-center space-x-4"><span>Need Level</span>
                                <select id="need" className="p-3 border rounded-lg text-base max-w w-full" value={form.need} onChange={handleInputChange}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Very High">Very High</option>
                                </select>
                            </label>
                            <button type="submit" className="bg-green-500 text-white py-2 text-base rounded-lg hover:bg-green-600 transition-all duration-300">Save</button>
                            <button type="button" className="bg-gray-400 text-white py-2 text-base rounded-lg hover:bg-gray-500 transition-all duration-300" onClick={() => setEditingPiggy(null)}>Cancel</button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-sm mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-4">Create New Piggy</h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                                <input type="text" id="title" className="p-3 border rounded-lg text-base" placeholder="Title" value={form.title} onChange={handleInputChange} required/>
                                <input type="number" id="amount" className="p-3 border rounded-lg text-base" placeholder="Amount" value={form.amount} onChange={handleInputChange} required/>
                                <input type="number" id="goal" className="p-3 border rounded-lg text-base" placeholder="Goal" value={form.goal} onChange={handleInputChange} required/>
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-4"><span>Need Level</span>
                                    <select id="need" className="p-3 border rounded-lg text-base max-w w-full" value={form.need} onChange={handleInputChange}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Very High">Very High</option>
                                    </select>
                                </label>
                                <button type="submit" className="bg-green-500 text-white py-2 text-base rounded-lg hover:bg-green-600 transition-all duration-300">Add Piggy Bank</button>
                            </form>
                        </div>

                        {piggies.map((piggy) => (
                            <div key={piggy._id} className="relative bg-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full max-w-sm mx-auto">
                                <button className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md hover:bg-red-600" onClick={() => deletePiggyBank(piggy._id)}>X</button>
                                <p className="text-gray-800 font-extrabold text-2xl text-center mt-2 pb-8">{piggy.title}</p>
                                <ProgressBar value={piggy.amount} max={piggy.goal} />
                                <p className="text-gray-700 text-lg font-semibold mt-2 pt-4 pb-4">Need: <span className="font-bold">{piggy.need}</span></p>
                                <button className="bg-blue-500 text-white px-5 py-3 text-lg rounded-lg hover:bg-blue-600 transition-all duration-300 mt-4"
                                        onClick={() => {
                                            setEditingPiggy(piggy);
                                            setForm({
                                                title: piggy.title,
                                                amount: piggy.amount,
                                                goal: piggy.goal,
                                                need: piggy.need,
                                            });
                                        }}>
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
