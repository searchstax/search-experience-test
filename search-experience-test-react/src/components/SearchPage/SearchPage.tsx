import { useEffect, useMemo, useState } from 'react';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

import { FacetList } from '../FacetList/FacetList';
import { ThumbnailImage } from '../ThumbnailImage/ThumbnailImage';

import { crawl, getCrawl } from '../../api/crawl';

import type { crawlFacet, crawlResult } from '../../interface/crawlResult';

// Joy
import Alert from '@mui/joy/Alert';
import Autocomplete from '@mui/joy/Autocomplete';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

// Icons
import SearchIcon from '@mui/icons-material/Search';

let crawlChecker = setTimeout(() => {}, 0);

function SearchPage(props: {
	startURL?: string,
	pageData?: any | undefined,
	crawlQualityCallback?: (crawlQuality: any) => void,
}) {
	const {
		startURL = '',
		pageData = undefined,
		crawlQualityCallback = () => {},
	} = props;
  const [requestURL, setRequestURL] = useState<string>(startURL);
  const [requestURLValid, setRequestURLValid] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkCrawl, setCheckCrawl] = useState<boolean>(false);
  const [crawlSuccess, setCrawlSuccess] = useState<boolean | undefined>(undefined);
  const [crawlID, setCrawlID] = useState<string>('');
  const [crawlData, setCrawlData] = useState<crawlResult[]>([]);
  const [facets, setFacets] = useState<crawlFacet[]>([]);
	const [crawlError, setCrawlError] = useState<string>('');

	const [color, setColor] = useState<string>('#999');
	const theme = useMemo(
	  () =>
	    extendTheme({
	    	cssVarPrefix: "nested",
			  typography: {
			    fontFamily: {
			      display: 'Roboto',
			      body: 'Roboto',
			    }
			  },
			  colorSchemes: {
			    light: {
			      palette: {
			        primary: {
			          solidBg: color,
			          solidHoverBg: '#F38666',
			          outlinedBorder: color,
			          500: color,
			        }
			      }
			    },
			    dark: {
			      palette: {}
			    }
			  },
	    }),
	  [color],
	);

	useEffect(() => {
		if (startURL != '') {
			let regex = /^((https?):\/\/)?[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
			setRequestURLValid(regex.test(startURL));
		}
	}, [startURL]);

  const loadSearch = (): void => {
		setLoading(true);
		setCrawlSuccess(undefined);
		setCrawlID('');
		setCrawlData([]);
		setFacets([]);
		setCrawlError('');
		void crawl(requestURL).then(response => {
			if(response.data.crawlID !== '') {
				setCrawlID(response.data.crawlID);
				setCheckCrawl(true);
				pollCrawl(response.data.crawlID);
			}
			setLoading(false);
		}).catch((error: Error) => {
			setLoading(false);
			setCrawlSuccess(false);
			setCrawlError('Too many requests');
			console.log(error);
		});
  }
  
  const pollCrawl = (id: string): void => {
	  void getCrawl(id).then(response => {
		  if (response.data.crawlID !== '') {
			  if (response.data.status === 2) {
					clearTimeout(crawlChecker);
					setCrawlData(response.data.pageData || []);
					setFacets(response.data.facetData || []);
					setCrawlSuccess(true);
					setCheckCrawl(false);
					if (crawlQualityCallback) {
						crawlQualityCallback({
							'titledescription': !response?.data?.pageData?.some((result) => result.title === '' || result.description === ''),
							'metadata': (response?.data?.facetData || []).length > 0,
							'images': response?.data?.pageData?.some((result) => result.image !== '' )
						});
					}
			  }
			  if (response?.data?.status === 1) {
					setTimeout(() => {
						pollCrawl(id);
					}, 1000);
			  }
			  if (response?.data?.status && response.data.status < 1) {
					clearTimeout(crawlChecker);
					setCrawlSuccess(false);
					setCheckCrawl(false);
			  }
		  }
	  });
  }

  return (
    <Box
      sx={{
        margin: 'auto',
        maxWidth: '1178px',
      }}
    >
		<Stack spacing={2} alignItems="center">
			{crawlSuccess === undefined && checkCrawl === false && (
				<Card size="lg" sx={{maxWidth: 600}}>
					<Stack spacing={2}>
						<Typography>
							Crawl my site and show search preview
						</Typography>
						<FormControl sx={{height: 80}}>
							<FormLabel>
							  URL
							</FormLabel>
							<Input
							  placeholder="https://www.example.com"
							  required
							  value={requestURL}
							  onChange={(_e) => {
									setRequestURL(_e.target.value);
									let regex = /^((https?):\/\/)?[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
									setRequestURLValid(regex.test(_e.target.value));
							  }}
							  error={requestURLValid === false}
							  disabled={checkCrawl}
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
							onClick={(_e) => { loadSearch()}}
							loading={loading}
							disabled={requestURL === '' || !requestURLValid || checkCrawl}
						>
							Crawl
						</Button>
					</Stack>
				</Card>
			)}
			<Stack spacing={1}>
				{checkCrawl && (
					<Stack sx={{margin: 'auto', minWidth: 500}} spacing={3}>
						<Typography>
							Crawling your site
						</Typography>
						<LinearProgress variant="soft" />
					</Stack>
				)}
				{crawlSuccess === true && crawlID !== '' && (
					crawlData.length === 0 ? (
						<Alert>
							<Button
								onClick={() => {
									setLoading(false);
									setCrawlSuccess(undefined);
									setCrawlID('');
									setCrawlData([]);
									setFacets([]);
									setCrawlError('');
								}}
							>
								Start Over
							</Button>
							Couldn't find any pages
						</Alert>
					)
					: (
						<Stack spacing={0.5}>
							<Stack direction="row" spacing={0.5} alignItems="center">
								<Typography>
									Color
								</Typography>
								{pageData?.searchpage?.mainColors?.map((color: any, index: number) => (
									<Box
										key={index}
										onClick={() => setColor(`rgba(${color[0]}, ${color[1]}, ${color[2]})`)}
										sx={{
											borderRadius: '100%',
											height: 30,
											width: 30,
											backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]})`,
											boxShadow: '2px 2px 5px rgba(150, 150, 150, 0.5)'
										}}
									/>
								))}
							</Stack>
	    				<CssVarsProvider theme={theme} disableNestedContext>
								<Stack spacing={2}>
									<Alert variant="plain">
										<Box sx={{width: 200}}>
											<Button
												variant="plain"
												onClick={() => {
													setLoading(false);
													setCrawlSuccess(undefined);
													setCrawlID('');
													setCrawlData([]);
													setFacets([]);
													setCrawlError('');
												}}
											>
												Start Over
											</Button>
										</Box>
										<Autocomplete
											size="lg"	
											disabled
											value={`${requestURL.replace('https://', '')} Search Demo`}
											options={[]}
		      						endDecorator={<SearchIcon />}
		      						sx={{width: 600}}
		      					/>
									</Alert>
									<Stack direction="row" spacing={3}>
										<FacetList facets={facets} />
										<Stack spacing={1}>
											<Alert variant="soft" color="primary">
												<Stack spacing={1}>
													<Typography component="h2">
														Add Promoted Search Results
													</Typography>
													<Typography>
														Create custom promotions for on-site and external websites
													</Typography>
													<Box>
														<Button color="primary">
															Learn More
														</Button>
													</Box>
												</Stack>
											</Alert>
											{crawlData
												.slice(0, 10)
												.map((result, index) => (
												<Box
													key={index}
													component="a"
													href={result?.url}
													target="_blank"
													sx={(theme) => ({
														textDecoration: 'none',
														display: 'flex',
														height: '100%',
														width: '100%',
														border: 'solid',
														borderWidth: '2px',
														borderRadius: '5px',
														borderColor: theme.vars.palette.background.level1,
														p: '1px',
													})}
												>
													<Sheet
														sx={{
															p: 1
														}}
													>
														<Stack direction="row" spacing={2}>
															{result.image !== '' && (
																<ThumbnailImage imageURL={result.image} />
															)}
															<Stack spacing={1}>
																<Box
																	sx={{
																		fontWeight: 700
																	}}
																>
																	{result.title}
																</Box>
																<Box>
																	{result.description ? result.description : result.text.substring(0, 300)}
																</Box>
																<Box
																	sx={{
																		fontSize: 12
																	}}
																>
																	{result.url}
																</Box>
															</Stack>
														</Stack>
													</Sheet>
												</Box>
											))}
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Button disabled variant="plain">
													Previous
												</Button>
												<Typography>
													Showing results 1 - 10
												</Typography>
												<Button variant="plain">
													Next
												</Button>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
	    				</CssVarsProvider>
	    			</Stack>
					)
				)}
				{crawlSuccess === false && (
					<Alert color="danger">
						<Button
							onClick={() => {
								setLoading(false);
								setCrawlSuccess(undefined);
								setCrawlID('');
								setCrawlData([]);
								setFacets([]);
								setCrawlError('');
							}}
						>
							Start Over
						</Button>
						{`Unable to crawl that URL${crawlError !== '' ? ` - ${crawlError}` : ''}`}
					</Alert>
				)}
			</Stack>
		</Stack>
	</Box>
  )
}

export default SearchPage
