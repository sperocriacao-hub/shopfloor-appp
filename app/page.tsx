import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Home() {
  const stats = [
    { name: 'Áreas Ativas', value: '4', icon: Boxes, color: 'text-blue-500' },
    { name: 'Operadores', value: '12', icon: Users, color: 'text-slate-500' },
    { name: 'Alertas OEE', value: '2', icon: AlertTriangle, color: 'text-orange-500' },
    { name: 'Eficiência Global', value: '87%', icon: CheckCircle, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visão geral do chão de fábrica.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral da Produção</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-slate-400 border border-dashed rounded-md">
              Gráfico de Produção (Placeholder)
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['CNC - Fanuc', 'Lixagem A', 'Resina Final'].map((station) => (
                <div key={station} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <ActivityIcon />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{station}</p>
                    <p className="text-xs text-muted-foreground">Em operação</p>
                  </div>
                  <div className="ml-auto font-medium text-green-600">On</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg
      className=" h-4 w-4 text-slate-500"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
