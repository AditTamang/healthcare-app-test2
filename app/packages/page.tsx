import { db } from "@/lib/db"

export default async function DoctorPage() {
    const doctors = await db.healthPackage.findMany({
    })
    return (
        <div>
            {doctors && doctors?.map((doc) => {
                return (
                    <div>
                        <p>{doc.name}</p>
                    </div>
                )
            })}
        </div>
    )
}