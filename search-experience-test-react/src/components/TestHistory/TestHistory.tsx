import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getTestHistory } from '../../api/test';
// Joy
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';

function TestHistory() {
  const [loading, setLoading] = useState<boolean>(false);
	const [historyData, setHistoryData] = useState<any | undefined>(undefined);
  const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
    if (historyData == undefined) {
    	void getTestHistory().then(response => {
    		setHistoryData(response);
    		setLoading(false);
		}).catch((error: Error) => {
			setHistoryData([]);
			setLoading(false);
			console.error(error);
		});
    }
  }, []);

  const viewTest = (id: string): void => {
		navigate(`?test=${id}`);
	};

  return (
    <Box
      sx={{
        margin: 'auto',
        minWidth: '800px',
        maxWidth: '1024px'
      }}
    >
    	{historyData?.tests?.length > 0 && (
    		<Card>
					<Stack spacing={1}>
						<Typography level="h3">Previous Tests</Typography>
						<Sheet>
							<Table>
								<thead>
									<tr>
										<th>Date</th>
										<th style={{width: '30%'}}>Domain</th>
										<th>Accessibility</th>
										<th>Search Quality</th>
										<th>Crawlability</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={6}>
												<Stack sx={{margin: 'auto', minWidth: 500}} spacing={3}>
													<Typography>
														Getting tests
													</Typography>
													<LinearProgress variant="soft" />
												</Stack>
											</td>
										</tr>
									) :
									historyData?.tests?.map((testData: any, index: number) => (
										<tr key={index}>
											<td>
												<Typography>
													{new Date(testData.created).toLocaleDateString('en-US')}
												</Typography>
											</td>
											<td>
												<Typography>
													{testData.requestURL}
												</Typography>
											</td>
											<td>
												<LinearProgress thickness={3} determinate value={
													(testData.lighthouseScore.accessibility
													+ testData.lighthouseScore.performance
													+ testData.lighthouseScore.seo
													) / 3 * 100} />
											</td>
											<td>
												<LinearProgress thickness={3} determinate value={
													(testData.testScore.autocomplete
													+ testData.testScore.googleAnalytics
													+ testData.testScore.spellchecking
													) / 3 * 100} />
											</td>
											<td>
												<LinearProgress thickness={3} determinate value={
													(testData.crawlScore.facets
													+ testData.crawlScore.facets
													+ testData.crawlScore.facets
													) / 3 * 100} />
											</td>
											<td style={{textAlign: 'center'}}>
												<Button
													size="sm"
													variant="outlined"
													onClick={() => { viewTest(testData.testID); }}
												>
													View Test
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</Sheet>
					</Stack>
				</Card>
			)}
		</Box>
  )
}

export default TestHistory
