import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Skeleton } from './components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface TableEntry {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: TableEntry[];
}

interface CompetitionData {
  id: number;
  name: string;
  code: string;
  emblem: string;
}

interface StandingsResponse {
  competition: CompetitionData;
  standings: Standing[];
}

interface Competition {
  id: number;
  name: string;
  code: string;
}

const App = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([
    { id: 2021, name: 'Premier League', code: 'PL' },
    { id: 2014, name: 'La Liga', code: 'PD' },
    { id: 2019, name: 'Serie A', code: 'SA' },
    { id: 2002, name: 'Bundesliga', code: 'BL1' },
    { id: 2015, name: 'Ligue 1', code: 'FL1' }
  ]);
  
  const [selectedCompetition, setSelectedCompetition] = useState<string>('2021');
  const [standings, setStandings] = useState<StandingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedCompetition) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:5000/standings/${selectedCompetition}`);

        
        if (!response.ok) {
          throw new Error('Failed to fetch standings');
        }
        
        const data = await response.json();
        setStandings(data);
      } catch (err) {
        setError('Failed to load standings. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStandings();
  }, [selectedCompetition]);

  const handleCompetitionChange = (value: string) => {
    setSelectedCompetition(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Football Standings</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a competition to view the current standings table
          </p>
        </div>
        
        <div className="mb-8 max-w-xs mx-auto">
          <Select 
            value={selectedCompetition} 
            onValueChange={handleCompetitionChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id.toString()}>
                  {competition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : standings ? (
          <StandingsTable standings={standings} />
        ) : null}
      </div>
    </div>
  );
};

const StandingsTable = ({ standings }: { standings: StandingsResponse }) => {
  // Find the TOTAL type standings (most common)
  const totalStandings = standings.standings.find(s => s.type === 'TOTAL') || standings.standings[0];
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {standings.competition.emblem && (
            <img 
              src={standings.competition.emblem} 
              alt={standings.competition.name} 
              className="h-8 w-8 object-contain"
            />
          )}
          <CardTitle className="text-xl">{standings.competition.name} Standings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="stats">Team Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standings" className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Pos</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center w-12">P</TableHead>
                    <TableHead className="text-center w-12">W</TableHead>
                    <TableHead className="text-center w-12">D</TableHead>
                    <TableHead className="text-center w-12">L</TableHead>
                    <TableHead className="text-center w-12">GF</TableHead>
                    <TableHead className="text-center w-12">GA</TableHead>
                    <TableHead className="text-center w-12">GD</TableHead>
                    <TableHead className="text-center w-12">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalStandings.table.map((entry) => (
                    <TableRow 
                      key={entry.team.id}
                      className={entry.position <= 4 ? "bg-green-50" : entry.position >= totalStandings.table.length - 3 ? "bg-red-50" : undefined}
                    >
                      <TableCell className="font-medium text-center">{entry.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img 
                            src={entry.team.crest} 
                            alt={entry.team.name}
                            className="h-6 w-6 object-contain"
                          />
                          <span className="hidden md:inline">{entry.team.name}</span>
                          <span className="md:hidden">{entry.team.shortName || entry.team.tla}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{entry.playedGames}</TableCell>
                      <TableCell className="text-center">{entry.won}</TableCell>
                      <TableCell className="text-center">{entry.draw}</TableCell>
                      <TableCell className="text-center">{entry.lost}</TableCell>
                      <TableCell className="text-center">{entry.goalsFor}</TableCell>
                      <TableCell className="text-center">{entry.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{entry.goalDifference}</TableCell>
                      <TableCell className="font-bold text-center">{entry.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-50 border border-green-200"></div>
                <span>Champions League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-50 border border-red-200"></div>
                <span>Relegation</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Goals For</TableHead>
                    <TableHead className="text-center">Goals Against</TableHead>
                    <TableHead className="text-center">Goal Difference</TableHead>
                    <TableHead className="text-center">Win %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalStandings.table
                    .sort((a, b) => b.goalsFor - a.goalsFor)
                    .map((entry) => (
                    <TableRow key={entry.team.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img 
                            src={entry.team.crest} 
                            alt={entry.team.name}
                            className="h-6 w-6 object-contain"
                          />
                          <span className="hidden md:inline">{entry.team.name}</span>
                          <span className="md:hidden">{entry.team.shortName || entry.team.tla}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{entry.goalsFor}</TableCell>
                      <TableCell className="text-center">{entry.goalsAgainst}</TableCell>
                      <TableCell className={`text-center font-medium ${entry.goalDifference > 0 ? 'text-green-600' : entry.goalDifference < 0 ? 'text-red-600' : ''}`}>
                        {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                      </TableCell>
                      <TableCell className="text-center">
                        {((entry.won / entry.playedGames) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <Card className="shadow-md">
    <CardHeader>
      <Skeleton className="h-8 w-64" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <Card className="bg-red-50 border-red-200">
    <CardContent className="pt-6">
      <p className="text-red-800 text-center">{message}</p>
    </CardContent>
  </Card>
);

export default App;
