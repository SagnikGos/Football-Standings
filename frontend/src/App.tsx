import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Skeleton } from './components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface Team {
  id: string;
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

// Removed football cursor styles, kept only the theme toggle animation
const themeToggleStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .theme-toggle-btn:hover {
    animation: spin 1s linear infinite;
  }
`;

const App = () => {
  const competitions = useState<Competition[]>([
    { id: 2021, name: 'Premier League', code: 'PL' },
    { id: 2014, name: 'La Liga', code: 'PD' },
    { id: 2019, name: 'Serie A', code: 'SA' },
    { id: 2002, name: 'Bundesliga', code: 'BL1' },
    { id: 2015, name: 'Ligue 1', code: 'FL1' }
  ])[0];
  
  const [selectedCompetition, setSelectedCompetition] = useState<string>('2021');
  const [standings, setStandings] = useState<StandingsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedCompetition) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://football-standings-6ucz.onrender.com/standings/${selectedCompetition}`);
        
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('bg-gray-950', theme === 'dark');
    document.body.classList.toggle('bg-gray-50', theme === 'light');
    document.body.classList.toggle('text-white', theme === 'dark');
  }, [theme]);

  const handleCompetitionChange = (value: string) => {
    setSelectedCompetition(value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Inject theme toggle styles */}
      <style>{themeToggleStyles}</style>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Football Standings</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="theme-toggle-btn rounded-full transition-transform hover:scale-110"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Select a competition to view the current standings table
          </p>
        </div>
        
        <div className="mb-8 max-w-xs mx-auto">
          <Select 
            value={selectedCompetition} 
            onValueChange={handleCompetitionChange}
          >
            <SelectTrigger className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'} transition-all hover:scale-105`}>
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent className={`${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'} animate-in fade-in-80 slide-in-from-top-5 z-50`} position="popper" align="center">
              {competitions.map((competition) => (
                <SelectItem 
                  key={competition.id} 
                  value={competition.id.toString()}
                  className="transition-colors hover:bg-opacity-10"
                >
                  {competition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <LoadingSkeleton theme={theme} />
        ) : error ? (
          <ErrorMessage message={error} theme={theme} />
        ) : standings ? (
          <StandingsTable standings={standings} theme={theme} />
        ) : null}
      </div>
    </div>
  );
};

const StandingsTable = ({ standings, theme }: { standings: StandingsResponse; theme: 'light' | 'dark' }) => {
  // Find the TOTAL type standings (most common)
  const totalStandings = standings.standings.find(s => s.type === 'TOTAL') || standings.standings[0];
  
  return (
    <Card className={`shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''} transition-all duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {standings.competition.emblem && (
            <img 
              src={standings.competition.emblem} 
              alt={standings.competition.name} 
              className="h-20 w-20 object-contain transition-transform hover:scale-110"
            />
          )}
          <CardTitle className="text-2xl">{standings.competition.name} Standings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 mb-4 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
            <TabsTrigger 
              value="standings" 
              className={`transition-all duration-200 data-[state=active]:${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
            >
              Standings
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className={`transition-all duration-200 data-[state=active]:${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}
            >
              Team Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="standings" className="space-y-4 animate-in fade-in-50 slide-in-from-left-5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={theme === 'dark' ? 'border-gray-700' : ''}>
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
                      className={`
                        ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-100'} 
                        transition-colors duration-150
                        ${entry.position <= 4 
                          ? theme === 'dark' ? "bg-green-900 bg-opacity-30" : "bg-green-50" 
                          : entry.position >= totalStandings.table.length - 3 
                          ? theme === 'dark' ? "bg-red-900 bg-opacity-30" : "bg-red-50"
                          : undefined}
                      `}
                    >
                      <TableCell className="font-medium text-center">{entry.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={entry.team.crest} 
                            alt={entry.team.name}
                            className="h-10 w-10 object-contain transition-transform hover:scale-125" 
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
            
            <div className="flex flex-col md:flex-row gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 ${theme === 'dark' ? 'bg-green-900 bg-opacity-30 border-green-800' : 'bg-green-50 border-green-200'} border`}></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>Champions League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 ${theme === 'dark' ? 'bg-red-900 bg-opacity-30 border-red-800' : 'bg-red-50 border-red-200'} border`}></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>Relegation</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="animate-in fade-in-50 slide-in-from-right-5">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Scorers Section */}
              <Card className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
                <CardHeader>
                  <CardTitle className="text-lg">Top Goal Scoring Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {totalStandings.table
                      .sort((a, b) => b.goalsFor - a.goalsFor)
                      .slice(0, 5)
                      .map((entry, index) => (
                        <div key={entry.team.id} className="flex items-center gap-3">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            {index + 1}
                          </div>
                          <img 
                            src={entry.team.crest} 
                            alt={entry.team.name}
                            className="h-8 w-8 object-contain"
                          />
                          <span className="flex-1">{entry.team.name}</span>
                          <span className="font-bold">{entry.goalsFor} goals</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Best Defenses Section */}
              <Card className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
                <CardHeader>
                  <CardTitle className="text-lg">Best Defensive Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {totalStandings.table
                      .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
                      .slice(0, 5)
                      .map((entry, index) => (
                        <div key={entry.team.id} className="flex items-center gap-3">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            {index + 1}
                          </div>
                          <img 
                            src={entry.team.crest} 
                            alt={entry.team.name}
                            className="h-8 w-8 object-contain"
                          />
                          <span className="flex-1">{entry.team.name}</span>
                          <span className="font-bold">{entry.goalsAgainst} conceded</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Form Table */}
              <Card className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} md:col-span-2`}>
                <CardHeader>
                  <CardTitle className="text-lg">Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className={theme === 'dark' ? 'border-gray-700' : ''}>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">Win Rate</TableHead>
                          <TableHead className="text-center">Goals per Game</TableHead>
                          <TableHead className="text-center">Conceded per Game</TableHead>
                          <TableHead className="text-center">Points per Game</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {totalStandings.table
                          .sort((a, b) => (b.won / b.playedGames) - (a.won / a.playedGames))
                          .map((entry) => (
                          <TableRow key={entry.team.id} className={theme === 'dark' ? 'border-gray-700 hover:bg-gray-600' : 'hover:bg-gray-100'}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <img 
                                  src={entry.team.crest} 
                                  alt={entry.team.name}
                                  className="h-8 w-8 object-contain"
                                />
                                <span>{entry.team.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {((entry.won / entry.playedGames) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-center">
                              {(entry.goalsFor / entry.playedGames).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              {(entry.goalsAgainst / entry.playedGames).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {(entry.points / entry.playedGames).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = ({ theme }: { theme: 'light' | 'dark' }) => (
  <Card className={`shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
    <CardHeader>
      <div className="flex items-center gap-3">
        <Skeleton className={`h-16 w-16 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <Skeleton className={`h-8 w-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Skeleton className={`h-10 w-10 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <Skeleton className={`h-6 w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ErrorMessage = ({ message, theme }: { message: string; theme: 'light' | 'dark' }) => (
  <Card className={theme === 'dark' ? 'bg-red-900 bg-opacity-30 border-red-800' : 'bg-red-50 border-red-200'}>
    <CardContent className="pt-6">
      <p className={theme === 'dark' ? 'text-red-300 text-center' : 'text-red-800 text-center'}>{message}</p>
    </CardContent>
  </Card>
);

export default App;