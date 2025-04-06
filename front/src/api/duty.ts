export interface Duty {
    date: string;
    attendants: string[];
    reserves: string[];
}

export async function getAllDuties(): Promise<Duty[]> {
    try {
        const response = await fetch('http://localhost:5000/api/duty');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при загрузке дежурств');
        }

        const duties = await response.json() as Duty[];
        return duties.map(duty => ({
            date: duty.date,
            attendants: duty.attendants || [],
            reserves: duty.reserves || [],
        }));
    } catch (error) {
        let errorMessage = "Ошибка в getAllDuties";
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        }
        console.error(errorMessage);
        throw error;
    }
}

export async function addOrRemoveDuty(
    date: string,
    operation: 'add' | 'remove',
    userId: string,
    type: 'attendants' | 'reserves' = 'attendants'
) {
    const endpoint =
        type === 'reserves' ? `/api/duty/${date}/reserve` : `/api/duty/${date}`;

    const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            operation,
            userId
        }),
        redirect: "follow"
    });

    return response.status === 200;
}
