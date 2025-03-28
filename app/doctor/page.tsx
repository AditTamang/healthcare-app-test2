import { db } from "@/lib/db"

export default async function DoctorPage() {
    const doctors = await db.doctorProfile.findMany({});

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {doctors && doctors.map((doc) => (
                <div key={doc.id} className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
                    <img 
                        src="/mahabir.png"
                        alt={doc.specialty} 
                        className="w-32 h-32 object-cover rounded-full"
                    />
                    <h2 className="text-xl font-semibold mt-3">{doc.specialty}</h2>
                    <p className="text-gray-600">{doc.specialty}</p>
                </div>
            ))}        </div>
    );
}
