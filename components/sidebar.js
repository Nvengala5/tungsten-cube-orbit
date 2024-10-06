export default function Sidebar() {
    return (
        <div className="flex flex-col w-64 min-h-screen border-r border-neutral-500 bg-neutral-900">
            <div className="py-8 px-6 space-y-6">
                <div className="hover:underline cursor-pointer">
                    Homepage
                </div>
                <div className="hover:underline cursor-pointer">
                    Orbit Map
                </div>
                <div className="hover:underline cursor-pointer">
                    Orbit Data
                </div>
            </div>
        </div>
    )
}