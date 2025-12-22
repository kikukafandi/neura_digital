// app/login/page.jsx
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function LoginPage() {
    // Cek kalau user sudah login, tendang ke dashboard
    const session = await auth()
    if (session) {
        redirect("/test-db") // Atau ke /dashboard nanti
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                <h1 className="text-2xl font-bold text-gray-900">Masuk ke Simpul Nalar</h1>
                <p className="text-gray-500">Mulai kelola produktivitasmu hari ini.</p>

                <div className="space-y-4 pt-4">
                    {/* TOMBOL GOOGLE */}
                    <form
                        action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/test-db" })
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition"
                        >
                            <span>Lanjutkan dengan Google</span>
                        </button>
                    </form>

                    {/* TOMBOL GITHUB */}
                    <form
                        action={async () => {
                            "use server"
                            await signIn("github", { redirectTo: "/test-db" })
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition"
                        >
                            <span>Lanjutkan dengan GitHub</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}