import { useState } from 'react'

import { checkURL, checkRelevance, checkFeatures } from '../../api/check';

import SearchStart from '../SearchStart/SearchStart';
import SearchResults from '../SearchResults/SearchResults';
import KeywordRelevance from '../KeywordRelevance/KeywordRelevance';
import SearchPage from '../SearchPage/SearchPage';

// Joy
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Checkbox from '@mui/joy/Checkbox';
import CircularProgress from '@mui/joy/CircularProgress';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Grid from '@mui/joy/Grid';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';
import Stepper from '@mui/joy/Stepper';
import Typography from '@mui/joy/Typography';

// Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import WarningIcon from '@mui/icons-material/Warning';

const defaultKeywordRelevancy = [
	{keyword: 'apply', data: {}},
	{keyword: 'financial aid', data: {}},
	{keyword: 'parking', data: {}},
];

function CheckPage() {
  const [requestURL, setRequestURL] = useState<string>('');
  const [requestURLValid, setRequestURLValid] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkSuccess, setCheckSuccess] = useState<boolean | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<number>(1);
	const [pageData, setPageData] = useState<any | undefined>(undefined);
	const [searchFeatures, setSearchFeatures] = useState<any | undefined>(undefined);
	const [crawlQuality, setCrawlQuality] = useState<any | undefined>(undefined);
	const [apiError, setApiError] = useState<string>('');

	const [hasAutosuggest, setHasAutosuggest] = useState<boolean | undefined>(undefined);
	const [hasSpellchecking, setHasSpellchecking] = useState<boolean | undefined>(undefined);
	
	const [keywordRelevancy, setKeywordRelevancy] = useState<any>(defaultKeywordRelevancy);

	let searchScore = 0;
	let maxScore = 300;

	if (hasAutosuggest !== undefined) {
		searchScore = searchScore + (hasAutosuggest ? 100 : 0);
		maxScore = maxScore + 100;
	}
	if (hasSpellchecking !== undefined) {
		searchScore = searchScore + (hasSpellchecking ? 100 : 0);
		maxScore = maxScore + 100;
	}

	if (searchFeatures !== undefined) {
		searchScore = searchScore + (searchFeatures.autosuggest ? 100 : 0);
		searchScore = searchScore + (searchFeatures.spellchecking ? 100 : 0);
		searchScore = searchScore + (searchFeatures.analytics ? 100 : 0);
		maxScore = maxScore + 300
	}

	if (crawlQuality !== undefined) {
		searchScore = searchScore + (crawlQuality.titledescription ? 100 : 0);
		searchScore = searchScore + (crawlQuality.metatags ? 100 : 0);
		searchScore = searchScore + (crawlQuality.images ? 100 : 0);
		maxScore = maxScore + 300
	}

	keywordRelevancy.map((keywordData: any) => {
		if (keywordData?.data?.searchpage?.searchQuality !== undefined) {
			searchScore = searchScore + keywordData?.data?.searchpage?.searchQuality[0]?.quality?.relevancy_score * 10;
			maxScore = maxScore + 100;
		}
	});
	searchScore = ((searchScore
							+ ((pageData?.pagespeed?.score?.performance | 0) * 100)
							+ ((pageData?.pagespeed?.score?.seo | 0) * 100)
							+ ((pageData?.pagespeed?.score?.wcag | 0) * 100)
							+ (pageData?.searchpage?.sitesearch?.height !== 0 ? 100 : 0)
						) / maxScore) * 100;

  const checkPage = (): void => {
		setLoading(true);
		setCheckSuccess(undefined);
		setPageData(undefined);
		setSearchFeatures(undefined);
		setApiError('');
		void checkURL(requestURL).then(response => {
			setCheckSuccess(true);
			setPageData(response.data);
			setLoading(false);
		}).catch((error: Error) => {
			setLoading(false);
			setCheckSuccess(false);
			setApiError('Too many requests');
			console.log(error);
		});
  }

  const checkKeywordRelevance = (keyword: string): Promise<any> => {
		setApiError('');
		return checkRelevance(pageData?.searchpage?.searchURL, keyword).then(response => {
			setKeywordRelevancy([
				...keywordRelevancy.map((keywordData: any) => {
					if (keywordData.keyword === keyword) {
						return {
							keyword: keywordData.keyword,
							data: response.data
						}
					}
					else {
						return keywordData
					}
				})
			]);
		}).catch((error: Error) => {
			setApiError('Could not get relevance data');
			console.log(error);
		});
  }

	const checkSearchFeatures = (): Promise<any> => {
		setApiError('');
		return checkFeatures(pageData?.searchpage?.searchURL).then(response => {
			setSearchFeatures(response?.data?.searchpage?.searchFeatures);
		}).catch((error: Error) => {
			setApiError('Could not get search features');
			console.log(error);
		});
  }

  const reset = (): void => {
		setLoading(false);
		setCheckSuccess(undefined);
		setPageData(undefined);
		setSearchFeatures(undefined);
		setApiError('');
		setCurrentStep(1);
		setPageData(undefined);
		setKeywordRelevancy(defaultKeywordRelevancy);

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
					<Stack sx={{maxWidth: 600, textAlign: 'center'}} spacing={1}>
						<Typography level="h1">Search Experience Test</Typography>
					</Stack>
					<Card size="lg" sx={{minWidth: 400, maxWidth: 600}}>
						<Stack spacing={2}>
							<FormControl sx={{height: 80}}>
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
							<Button
								onClick={(_e) => { checkPage()}}
								loading={loading}
								disabled={requestURL === '' || !requestURLValid || loading}
							>
								Test My Page
							</Button>
						</Stack>
					</Card>
				</Stack>
			)}
			<Stack spacing={1}>
				{loading && (
					<Stack sx={{margin: 'auto', minWidth: 500}} spacing={3}>
						<Typography>
							Checking your page
						</Typography>
						<LinearProgress variant="soft" />
					</Stack>
				)}
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
							<Alert variant="plain">
								<Stack spacing={2} sx={{width: '100%'}}>
									<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
										<Stack alignItems="center" justifyContent="center" spacing={1}>
											<Typography level="h4">
												Site Search Experience
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
												{`${requestURL.replace('https://', '').replace(/\/\.*\//,'')}`}
											</Typography>
										</Stack>
										</Box>
										<Box sx={{width: 200}}>
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
										        1
										      </StepIndicator>
										    }
										  >
										    Starting a Search
										  </Step>
										  <Step
										  	completed={currentStep > 2}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 2 ? 'solid' : 'outlined'}>2</StepIndicator>
										  	}
										  >
										    Initial Search Results
										  </Step>
										  <Step
										  	completed={currentStep > 3}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 3 ? 'solid' : 'outlined'}>3</StepIndicator>
										  	}
										  >
										  	Search Relevance
										  </Step>
										  <Step
										  	completed={currentStep > 4}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 4 ? 'solid' : 'outlined'}>4</StepIndicator>
										  	}
										  >
										  	Site Crawl
										  </Step>
										  <Step
										  	completed={currentStep > 5}
										  	orientation="vertical"
										  	indicator={
										  		<StepIndicator variant={currentStep === 5 ? 'solid' : 'outlined'}>5</StepIndicator>
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
							</Alert>
							{currentStep == 1 && (<SearchStart pageData={pageData} />)}
							{currentStep === 2 && (
								<SearchResults
									pageData={pageData}
									searchFeatures={searchFeatures}
									checkSearchFeaturesCallback={checkSearchFeatures}
								/>
							)}
							{currentStep === 3 && (
								<Grid container rowSpacing={3}>
									<Grid xs={12}>
										<Typography level="h4">
											Search Relevance
										</Typography>
									</Grid>
									{pageData?.searchpage?.searchURL && (
										keywordRelevancy.map((keywordData: any, index: number) => (
											<KeywordRelevance
												key={index}
												pageData={pageData}
												relevanceData={keywordData}
												checkRelevanceCallback={checkKeywordRelevance}
											/>
										))
									)}
								</Grid>
							)}
							<Box sx={{display: currentStep === 4 ? 'block': 'none'}}>
								<SearchPage
									startURL={requestURL}
									pageData={pageData}
									crawlQualityCallback={setCrawlQuality}
								/>
							</Box>
							{currentStep === 5 && (
								<Box>
									<Stack
										divider={<Divider />}
										spacing={3}
									>
										<Stack>
											<Typography level="h3">
												Finding Your Site Search
											</Typography>
											<Grid container rowSpacing={2} alignItems="center">
												<Grid xs={8}>
													<Typography>
														Google SEO Score
													</Typography>
												</Grid>
												<Grid xs={3}>
													<LinearProgress
														determinate
														value={pageData?.pagespeed?.score?.seo * 100}
														color={
															pageData?.pagespeed?.score?.seo > 0.9
															? 'success'
															: pageData?.pagespeed?.score?.seo > 0.7
															? 'warning' : 'danger'
														}
													/>
												</Grid>
												<Grid xs={1}>
													<Typography sx={{textAlign: 'right'}}>
														{((pageData?.pagespeed?.score?.seo || 0) * 100).toFixed(0)}
													</Typography>
												</Grid>
												<Grid xs={8}>
													<Typography>
														Page Load Speed
													</Typography>
												</Grid>
												<Grid xs={3}>
													<LinearProgress
														determinate
														value={pageData?.pagespeed?.score?.performance * 100}
														color={
															pageData?.pagespeed?.score?.performance > 0.9
															? 'success'
															: pageData?.pagespeed?.score?.performance > 0.7
															? 'warning' : 'danger'
														}
													/>
												</Grid>
												<Grid xs={1}>
													<Typography sx={{textAlign: 'right'}}>
														{((pageData?.pagespeed?.score?.performance || 0) * 100).toFixed(0)}
													</Typography>
												</Grid>
												<Grid xs={8}>
													<Typography>
														Site Search Bar
													</Typography>
												</Grid>
												<Grid xs={4}>
													{pageData?.searchpage?.sitesearch?.height !== 0 ? (
														<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
															Search Bar Found
														</Alert>
													) : (
														<Alert endDecorator={<WarningIcon />} color="warning">
															Could not find search bar
														</Alert>
													)}
												</Grid>
												<Grid xs={8}>
													<Typography>
														Site Search Schema
													</Typography>
												</Grid>
												<Grid xs={4}>
													{Object.keys(pageData?.schema).length !== 0 ? (
														<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
															Found Schema
														</Alert>
													) : (
														<Alert endDecorator={<WarningIcon />} color="warning">
															No Search Schema Found
														</Alert>
													)}
												</Grid>
											</Grid>
										</Stack>
										<Stack>
											<Typography level="h3">
												Search Result Page
											</Typography>
											<Grid container alignItems="center" rowSpacing={2}>
												<Grid xs={8}>
													<Typography>
														WCAG Accessibility
													</Typography>
												</Grid>
												<Grid xs={3}>
													<LinearProgress
														determinate
														value={pageData?.pagespeed?.score?.accessibility * 100}
														color={
															pageData?.pagespeed?.score?.accessibility > 0.9
															? 'success'
															: pageData?.pagespeed?.score?.accessibility > 0.7
															? 'warning' : 'danger'
														}
													/>
												</Grid>
												<Grid xs={1}>
													<Typography sx={{textAlign: 'right'}}>
														{((pageData?.pagespeed?.score?.accessibility || 0) * 100).toFixed(0)}
													</Typography>
												</Grid>
												<Grid xs={8}>
													<Typography>
														Auto Suggest
													</Typography>
												</Grid>
												<Grid xs={4}>
													{searchFeatures
														? searchFeatures.autocomplete ? (
															<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
																Autosuggest found!
															</Alert>
														) : (
															<Alert endDecorator={<HelpRoundedIcon />}>
																Not detected
															</Alert>
														)
													: (
														<Alert endDecorator={
															<Checkbox
																checked={hasAutosuggest}
																onClick={() => setHasAutosuggest(!hasAutosuggest)}
																indeterminate={hasAutosuggest === undefined}
															/>
														}>
															Not Tested
														</Alert>
													)}
												</Grid>
												<Grid xs={8}>
													<Typography>
														Spell Checking
													</Typography>
												</Grid>
												<Grid xs={4}>
													{searchFeatures
														? searchFeatures.spellchecking ? (
															<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
																Spell checking found!
															</Alert>
														) : (
															<Alert endDecorator={<HelpRoundedIcon />}>
																Not detected
															</Alert>
														)
													: (
														<Alert endDecorator={
															<Checkbox
																checked={hasSpellchecking}
																onClick={() => setHasSpellchecking(!hasSpellchecking)}
																indeterminate={hasSpellchecking === undefined}
															/>
														}>
															Not Tested
														</Alert>
													)}
												</Grid>
												<Grid xs={8}>
													<Typography>
														Analytics
													</Typography>
												</Grid>
												<Grid xs={4}>
													{searchFeatures
														? searchFeatures.analytics ? (
															<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
																Analytics found!
															</Alert>
														) : (
															<Alert endDecorator={<HelpRoundedIcon />}>
																Not detected
															</Alert>
														)
													: (
														<Alert>
															Not Tested
														</Alert>
													)}
												</Grid>
											</Grid>
										</Stack>
										<Stack>
											<Typography level="h3">
												Search Relevancy
											</Typography>
											<Grid container rowSpacing={1}>
												{keywordRelevancy.map((keywordData: any, index: number) => (
													keywordData?.data?.searchpage?.searchQuality !== undefined ? (
														<Grid container xs={12} key={index} alignItems="center">
															<Grid xs={8}>
																<Typography>
																	Relevancy for "{keywordData.keyword}"
																</Typography>
															</Grid>
															<Grid xs={3}>
																<LinearProgress
																	determinate
																	value={keywordData?.data?.searchpage?.searchQuality[0]?.quality?.relevancy_score * 10}
																	color={
																		keywordData?.data?.searchpage?.searchQuality[0]?.quality?.relevancy_score > 9
																		? 'success'
																		: keywordData?.data?.searchpage?.searchQuality[0]?.quality?.relevancy_score > 7
																		? 'warning' : 'danger'
																	}
																/>
															</Grid>
															<Grid xs={1}>
																<Typography sx={{textAlign: 'right'}}>
																	{keywordData?.data?.searchpage?.searchQuality[0]?.quality?.relevancy_score > 8
																		? keywordData?.data?.searchpage?.searchQuality[0]?.quality?.relevancy_score > 7
																		? 'High' : 'Medium': 'Low'
																	}
																</Typography>
															</Grid>
														</Grid>
													) : (
														<Grid container xs={12} key={index} alignItems="center">
															<Grid xs={8}>
																<Typography>
																	Relevancy for "{keywordData.keyword}"
																</Typography>
															</Grid>
															<Grid xs={4}>
																<Alert endDecorator={<HelpRoundedIcon />}>
																	Keyword Relevancy Not Tested
																</Alert>
															</Grid>
														</Grid>
													)
												))}
											</Grid>
										</Stack>
										<Stack>
											<Typography level="h3">
												Site Crawl
											</Typography>
											<Grid container alignItems="center" rowSpacing={2}>
												<Grid xs={8}>
													<Typography>
														Titles and Descriptions
													</Typography>
												</Grid>
												<Grid xs={4}>
													{crawlQuality
														? crawlQuality.titledescription ? (
															<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
																Descriptive titles and meta descriptions
															</Alert>
														) : (
															<Alert endDecorator={<WarningIcon />} color="warning">
																Some missing titles and descriptions
															</Alert>
														)
													: (
														<Alert>
															Not Tested
														</Alert>
													)}
												</Grid>
												<Grid xs={8}>
													<Typography>
														Meta Tags
													</Typography>
												</Grid>
												<Grid xs={4}>
													{crawlQuality
														? crawlQuality.metadata ? (
															<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
																Contextual meta tags discovered
															</Alert>
														) : (
															<Alert endDecorator={<HelpRoundedIcon />}>
																Not detected
															</Alert>
														)
													: (
														<Alert>
															Not Tested
														</Alert>
													)}
												</Grid>
												<Grid xs={8}>
													<Typography>
														Images
													</Typography>
												</Grid>
												<Grid xs={4}>
													{crawlQuality
														? crawlQuality.images ? (
															<Alert endDecorator={<CheckCircleRoundedIcon />} color="success">
																Thumbnail images
															</Alert>
														) : (
															<Alert endDecorator={<HelpRoundedIcon />}>
																Not detected
															</Alert>
														)
													: (
														<Alert>
															Not Tested
														</Alert>
													)}
												</Grid>
											</Grid>
										</Stack>
										<Stack direction="row">
											<Grid container xs={12} alignItems="center">
												<Grid xs={8}>
													<Typography level="h3">
														Search Experience Score
													</Typography>
												</Grid>
												<Grid xs={4} sx={{textAlign: 'right'}}>
													<CircularProgress
														determinate
														size="lg"
														value={searchScore}
														color={
															searchScore > 90
															? 'success'
															: searchScore > 70
															? 'warning' : 'danger'
														}
													>
													  {(searchScore).toFixed(0)}
													</CircularProgress>
												</Grid>
											</Grid>
										</Stack>
									</Stack>

								</Box>
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
