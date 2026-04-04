import { useState } from "react";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import { PlusCircle, ArrowRightLeft, CalendarClock } from 'lucide-react';

import { Role } from "../helpers/_variables";
import RecordModal from "../components/RecordModal";
import ReserveTable from "../components/Records/ReserveTable";
import BorrowTable from "../components/Records/BorrowTable";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Records = () => {
    const cookies = new Cookies();
    const token = cookies.get("CDIIS-OIS");
    const decoded = token ? jwtDecode(token) : { userRole: 'guest' };

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <title>CDIIS OIS - Asset Transactions</title>

            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl max-md:text-2xl font-bold tracking-tight text-slate-900">Transaction Records</h1>
                    <p className="text-slate-500 mt-1 max-md:text-sm">Manage asset reservations, active deployments, and return logs.</p>
                </div>

                {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Log Transaction
                    </Button>
                )}
            </div>

            {/* Tabbed Interface for Tables */}
            <Tabs defaultValue="borrowed" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-slate-200/60 p-1">
                        <TabsTrigger
                            value="borrowed"
                            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Active Deployments
                        </TabsTrigger>
                        <TabsTrigger
                            value="reserved"
                            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2"
                        >
                            <CalendarClock className="w-4 h-4" />
                            Pending Reservations
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Active Borrows View */}
                <TabsContent value="borrowed" className="m-0 outline-none">
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        {/* We wrap your existing table in a clean card to contain it */}
                        <BorrowTable decoded={decoded} />
                    </Card>
                </TabsContent>

                {/* Pending Reservations View */}
                <TabsContent value="reserved" className="m-0 outline-none">
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <ReserveTable decoded={decoded} />
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Transaction Modal */}
            <RecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Records;
