import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { testURL, getStatus, getTest } from '../../api/test';

import SearchStart from '../SearchStart/SearchStart';
import SearchResults from '../SearchResults/SearchResults';
import KeywordRelevance from '../KeywordRelevance/KeywordRelevance';
import SearchPage from '../SearchPage/SearchPage';
import SearchScore from '../SearchScore/SearchScore';
import TestHistory from '../TestHistory/TestHistory';

// Joy
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Grid from '@mui/joy/Grid';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';
import Stepper from '@mui/joy/Stepper';
import Typography from '@mui/joy/Typography';

let testChecker = setTimeout(() => {}, 0);

const defaultSearchTerms = [
	'about',
];

function CheckPage() {
  const [requestURL, setRequestURL] = useState<string>('');
  const [requestURLValid, setRequestURLValid] = useState<boolean | undefined>(undefined);
  const [searchTerms, setSearchTerms] = useState<string[]>(defaultSearchTerms);
  const [newSearchTerm, setNewSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkSuccess, setCheckSuccess] = useState<boolean | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [testStatus, setTestStatus] = useState<any | undefined>(undefined);
	const [pageData, setPageData] = useState<any | undefined>(undefined);
	const [apiError, setApiError] = useState<string>('');
 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const test = searchParams.get('test');
    if (test !== null) {
			setCheckSuccess(true);
      pollTest(test);
    }
  }, [searchParams]);

  const checkPage = (): void => {
		setLoading(true);
		setCheckSuccess(undefined);
		setPageData(undefined);
		setApiError('');
		
		void testURL(requestURL, searchTerms.join(',')).then(response => {
			setCheckSuccess(true);
			if (response?.testID !== '') {
				pollTest(response.testID);
				navigate(`?test=${response.testID}`);
			}
		}).catch((error: Error) => {
			setLoading(false);
			setCheckSuccess(false);
			setApiError('Too many requests');
			console.error(error);
		});
  }
  
  const pollTest = (id: string): void => {
	  void getStatus(id).then(response => {
		  if (response.testID !== '') {
				if (response.search?.status !== testStatus?.search?.status
					|| response.crawl?.status !== testStatus?.crawl?.status
					|| response.lighthouse?.status !== testStatus?.lighthouse?.status
				) {
					loadTest(id);
				}
				setTestStatus(response);
			  if (response.search?.status === 2) {
					clearTimeout(testChecker);
					setLoading(false);
			  }
			  if (response?.search?.status === 1) {
					clearTimeout(testChecker);
					setTimeout(() => {
						pollTest(id);
					}, 2000);
			  }
			  if (response?.search?.status && response.search.status < 0) {
					clearTimeout(testChecker);
					setLoading(false);
			  }
		  }
	  });
  }

  const loadTest = (id: string): void => {
	  void getTest(id).then(response => {
		  if (response.testID !== '') {
				setPageData(response);
		  }
	  });
  }

  const reset = (): void => {
		setLoading(false);
		setCheckSuccess(undefined);
		setPageData(undefined);
		setApiError('');
		setCurrentStep(1);
		clearTimeout(testChecker);
		navigate(`/`);
  }

  return (
    <Box
      sx={{
        margin: 'auto',
        maxWidth: '1178px',
      }}
    >
		<Stack spacing={2} alignItems="center">
			{checkSuccess === undefined && loading === false && (
				<Stack alignItems="center" spacing={3}>
					<Card size="lg" sx={{minWidth: 400, maxWidth: 600}}>
						<Stack spacing={2}>
							<Stack spacing={1}>
								<Typography level="h1">Search Experience Test</Typography>
								<Typography level="body-sm">
									Test your website to see how easily visitors can discover your site search page and find content on your website
								</Typography>
							</Stack>
							<FormControl>
								<FormLabel>
								  Search Page URL
								</FormLabel>
								<Input
								  placeholder="https://www.example.com/search"
								  required
								  value={requestURL}
								  onChange={(_e) => {
										setRequestURL(_e.target.value);
										let regex = /^((https?):\/\/)?[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/)?.*$/;
										setRequestURLValid(regex.test(_e.target.value));
								  }}
								  error={requestURLValid === false}
								  disabled={loading}
									sx={(theme) => ({ backgroundColor: theme.vars.palette.common.white })}
								/>
								{requestURLValid === false && (
								  <FormHelperText
										sx={(theme) => ({ color: theme.vars.palette.danger[400] })}
								  >
									Please enter a full URL
								  </FormHelperText>
								)}
							</FormControl>
							<Card>
								<Typography level="body-sm">
									Test Search Queries
								</Typography>
								<Stack spacing={0.5}>
									{searchTerms.map((term: any, index: number) => (
										<Chip
							      	key={index}
							        size="sm"
							        variant="outlined"
							        endDecorator={
							        	<ChipDelete
							        		onDelete={() => {
							        			setSearchTerms(searchTerms.filter(item => item !== term))
							        		}}
							        	/>
							        }
							      >
											{term}
							      </Chip>
									))}
									{searchTerms.length < 4 && (
										<Input
											size="sm"
											value={newSearchTerm}
											onChange={(_e) => setNewSearchTerm(_e.target.value)}
											endDecorator={
												<Button
													disabled={newSearchTerm === '' || searchTerms.includes(newSearchTerm)}
													onClick={() => {
														setSearchTerms([...searchTerms, newSearchTerm]);
														setNewSearchTerm('');
													}}
												>
													Add
												</Button>
											}
										/>
									)}
								</Stack>
							</Card>
							<Button
								onClick={(_e) => { checkPage()}}
								loading={loading}
								disabled={requestURL === '' || !requestURLValid || loading}
							>
								Test My Page
							</Button>
						</Stack>
					</Card>
					<TestHistory />
				</Stack>
			)}
			<Stack spacing={1}>
				{checkSuccess === true && (
					pageData === undefined ? (
						<Alert>
							<Button
								onClick={reset}
							>
								Start Over
							</Button>
							Couldn't find any pages
						</Alert>
					)
					: (
						<Stack spacing={2}>
							<Card>
								<Stack spacing={2} sx={{width: '100%'}}>
									<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
										<Stack alignItems="center" justifyContent="center" spacing={1}>
											<Typography level="h4">
												Search Experience Test
											</Typography>
										</Stack>
										<Box sx={{flexGrow: 1}}>
										<Stack direction="row" alignItems="center" spacing={2}>
											{pageData?.schema?.logo && pageData?.schema?.logo !== '' && (
												<AspectRatio ratio="1/1" sx={{ minWidth: 100, maxWidth: 300 }}>
													<Box
														component='img'
														src={pageData?.schema?.logo}
													/>
												</AspectRatio>
											)}
											<Typography>
												{`${pageData?.search?.data?.searchpage?.startURL.replace('https://', '').replace(/\/\.*\//,'')}`}
											</Typography>
										</Stack>
										</Box>
										<Box sx={{width: 200, textAlign: 'right'}}>
											<Button
												variant="plain"
												onClick={reset}
											>
												Start Over
											</Button>
										</Box>
									</Stack>
									<Stack spacing={2} sx={{width: '1178px'}}>
										<Stepper>
										  <Step
										  	completed={currentStep > 1}
										  	orientation="vertical"
										    indicator={
										      <StepIndicator variant={currentStep === 1 ? 'solid' : 'outlined'}>
										      	{pageData.search?.status === 1 ? (
											      	<CircularProgress size="sm" sx={{fontSize: 16}}>
												        1
												      </CircularProgress>
												     ) : '1'}
										      </StepIndicator>
										    }
										  >
										    Starting a Search
										  </Step>
										  <Step
										  	completed={currentStep > 2}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 2 ? 'solid' : 'outlined'}>
										      	{pageData.search?.status === 1 ? (
											      	<CircularProgress size="sm" sx={{fontSize: 16}}>
												        2
												      </CircularProgress>
												     ) : '2'}
										      </StepIndicator>
										  	}
										  >
										    Initial Search Results
										  </Step>
										  <Step
										  	completed={currentStep > 3}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 3 ? 'solid' : 'outlined'}>
										      	{pageData.stage === 3 ? (
											      	<CircularProgress size="sm" sx={{fontSize: 16}}>
												        3
												      </CircularProgress>
												     ) : '3'}
										      </StepIndicator>
										  	}
										  >
										  	Search Relevance
										  </Step>
										  <Step
										  	completed={currentStep > 4}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 4 ? 'solid' : 'outlined'}>
										      	{pageData.crawl?.status === 1 ? (
											      	<CircularProgress size="sm" sx={{fontSize: 16}}>
												        4
												      </CircularProgress>
												     ) : '4'}
										      </StepIndicator>
										  	}
										  >
										  	Site Crawl
										  </Step>
										  <Step
										  	completed={currentStep > 5}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 5 ? 'solid' : 'outlined'}>
										      	{pageData.crawl?.status === 1 || pageData.lighthouse.status === 1 || pageData.search.status === 1 ? (
											      	<CircularProgress size="sm" sx={{fontSize: 16}}>
												        5
												      </CircularProgress>
												     ) : '5'}
										      </StepIndicator>
										  	}
										  >
										  	Search Experience Score
										  </Step>
										</Stepper>
										<Stack spacing={2} direction="row" justifyContent="space-between">
											<Button
												variant="outlined"
												disabled={currentStep < 2}
												onClick={() => setCurrentStep(currentStep - 1)}
											>
												Previous Step
											</Button>
											<Button
												disabled={currentStep > 4}
												onClick={() => setCurrentStep(currentStep + 1)}
											>
												Next Step
											</Button>
										</Stack>
									</Stack>
								</Stack>
							</Card>
							{currentStep == 1 && (<SearchStart pageData={pageData} />)}
							{currentStep === 2 && (
								<SearchResults
									pageData={pageData}
								/>
							)}
							{currentStep === 3 && (
								<Grid container rowSpacing={3}>
									<Grid xs={12}>
										<Typography level="h4">
											Search Relevance
										</Typography>
									</Grid>
									<Stack divider={<Divider />} spacing={1}>
										{pageData?.search?.data?.searchpage?.searchURL && (
											pageData?.search?.data?.searchQuality.map((keywordData: any, index: number) => (
												<KeywordRelevance
													key={index}
													pageData={pageData}
													relevanceData={keywordData}
												/>
											))
										)}
									</Stack>
								</Grid>
							)}
							<Box sx={{display: currentStep === 4 ? 'block': 'none'}}>
								<SearchPage
									pageData={pageData}
								/>
							</Box>
							{currentStep === 5 && (
								<SearchScore pageData={pageData} />
							)}
						</Stack>
					)
				)}
				{checkSuccess === false && (
					<Alert color="danger">
						<Button
							onClick={reset}
						>
							Start Over
						</Button>
						{`Unable to crawl that URL${apiError !== '' ? ` - ${apiError}` : ''}`}
					</Alert>
				)}
			</Stack>
		</Stack>
	</Box>
  )
}

export default CheckPage
