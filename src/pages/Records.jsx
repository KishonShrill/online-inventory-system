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
        <div className="container mx-auto min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-transparent p-6 md:p-10 font-sans transition-colors duration-200">
            <title>CDIIS OIS - Asset Transactions</title>

            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl max-md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Transaction Records</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-md:text-sm">Manage asset reservations, active deployments, and return logs.</p>
                </div>

                {(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Log Transaction
                    </Button>
                )}
            </div>

            {/* Tabbed Interface for Tables */}
            <Tabs defaultValue="borrowed" className="w-full">
                <div className="flex max-sm:mx-auto items-center justify-between mb-4">
                    <TabsList className="bg-slate-200/60 dark:bg-slate-800 p-1">
                        <TabsTrigger
                            value="borrowed"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Deployed
                        </TabsTrigger>
                        <TabsTrigger
                            value="reserved"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400"
                        >
                            <CalendarClock className="w-4 h-4" />
                            Reserved
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Active Borrows View */}
                <TabsContent value="borrowed" className="m-0 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-colors">
                        <BorrowTable decoded={decoded} />
                    </Card>
                </TabsContent>

                {/* Pending Reservations View */}
                <TabsContent value="reserved" className="m-0 outline-none">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-colors">
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
