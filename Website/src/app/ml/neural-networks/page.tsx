import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import NeuralNetworkPlayground from "@/components/neural-networks/NeuralNetworkPlayground";

export default function NeuralNetworksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-20 min-h-screen">
        <div className="p-8 md:p-12">
          <NeuralNetworkPlayground />
        </div>
      </main>
    </div>
  );
}
