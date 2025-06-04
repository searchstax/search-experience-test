import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getTestHistory } from '../../api/test';
// Joy
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
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
        maxWidth: '800px',
      }}
    >
    	{historyData?.tests?.length > 0 && (
				<Stack spacing={1}>
					<Typography level="h3">
						Previous Tests
					</Typography>
					<Grid
						container
						rowSpacing={3}
					>
						{loading && (
							<Stack sx={{margin: 'auto', minWidth: 500}} spacing={3}>
								<Typography>
									Getting tests
								</Typography>
								<LinearProgress variant="soft" />
							</Stack>
						)}
						{historyData?.tests?.map((testData: any, index: number) => (
							<Grid container columnSpacing={2} xs={12} key={index}>
								<Grid xs={6}>
									<Typography>
										{testData.requestURL}
									</Typography>
								</Grid>
								<Grid xs={4}>
									<Typography>
										{new Date(testData.created).toLocaleDateString('en-US')}
									</Typography>
								</Grid>
								<Grid xs={2}>
									<Button
										size="sm"
										onClick={() => { viewTest(testData.testID); }}
									>
										View Test
									</Button>
								</Grid>
							</Grid>
						))}
					</Grid>
				</Stack>
			)}
		</Box>
  )
}

export default TestHistory
